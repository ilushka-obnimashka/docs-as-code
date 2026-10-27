# Диаграммы

Диаграммы показывают взаимодействие компонентов и основные сущности АС «УВК» в соответствии с [требованиями](requirements.md).

## Диаграмма последовательности

Диаграмма показывает **UC-01 «Получение рекомендаций книг»**. Предусловие: читатель авторизован bearer-токеном; получение токена находится вне API. Возрастной фильтр применяется до сравнения векторов; выдача и резервирование не входят в этот сценарий.

Вектор описания книги подготавливается заранее: при добавлении или изменении книги E5 отдельно обрабатывает текст с префиксом `passage:`, после чего система сохраняет результат в каталоге.

```mermaid
sequenceDiagram
    actor Reader as Читатель
    participant App as АС «УВК»
    participant Catalog as Каталог и сохраненные векторы
    participant Model as ML-модуль E5

    Reader->>App: Запросить рекомендации(интересы)
    App->>App: Проверить интересы
    alt Интересы пустые
        App-->>Reader: Предложить заполнить интересы
    else Интересы заполнены
        App->>App: Вычислить возраст по дате рождения
        App->>Catalog: Найти доступные экземпляры с маркировкой ≤ возраст
        Catalog-->>App: Кандидаты и сохраненные векторы книг
        alt Кандидатов нет
            App-->>Reader: Нет доступных по возрасту книг
        else Кандидаты найдены
            App->>Model: Векторизовать(query: интересы)
            Note over App,Model: Описания книг повторно не передаются
            alt Ошибка или нет ответа за 5 секунд
                App-->>Reader: Рекомендации недоступны, предложить обычный поиск
            else Вектор получен
                Model-->>App: Вектор запроса из 384 чисел
                App->>App: Сравнить с векторами книг и сортировать
                App->>App: Объединить экземпляры одной книги, взять до 5 книг
                alt Нет положительных оценок
                    App-->>Reader: Нет совпадений, предложить изменить интересы
                else Рекомендации найдены
                    App-->>Reader: Названия, авторы и возрастные маркировки
                end
            end
        end
    end
```

Обычный поиск при отказе модели также применяет возрастной фильтр.

## Диаграмма классов

Диаграмма отражает учет читателей, сотрудников и экземпляров, операции выдачи и формирование рекомендаций.

```mermaid
classDiagram
    class StaffMember {
        +int id
        +string fullName
        +string role
    }

    class Administrator {
        +createReader(fullName, birthDate, ticketBarcode) Reader
        +createStaff(fullName, role) StaffMember
    }

    class Librarian {
        +issue(reader, edition) Transaction
        +returnEdition(transaction) void
    }

    class Reader {
        +int id
        +string fullName
        +date birthDate
        +string ticketBarcode
        +string interests
        +getAge(currentDate) int
    }

    class Edition {
        +int id
        +int catalogRecordId
        +string title
        +string author
        +string genres
        +string annotation
        +int ageRestriction
        +string barcode
        +string status
        +isAvailable() bool
    }

    class Transaction {
        +int id
        +date issueDate
        +date returnDate
        +string status
        +close(returnDate) void
    }

    class Recommendation {
        +float score
        +int position
    }

    class RecommendationService {
        +recommend(reader, interests) List~Recommendation~
        +filterEligible(editions, age) List~Edition~
        +rankWithModel(interests, candidates) List~Recommendation~
    }

    StaffMember <|-- Administrator
    StaffMember <|-- Librarian
    Administrator ..> Reader : создает карточки
    Administrator ..> StaffMember : создает карточки
    Administrator ..> Edition : ведет каталог
    Librarian ..> Transaction : оформляет выдачу и возврат
    Reader "1" -- "0..*" Transaction : получает издания
    Edition "1" -- "0..*" Transaction : история выдач
    Reader "1" -- "0..*" Recommendation : получает рекомендации
    Recommendation "0..*" --> "1" Edition : рекомендует экземпляр
    RecommendationService ..> Reader : определяет возраст и интересы
    RecommendationService ..> Edition : фильтрует кандидатов
    RecommendationService ..> Recommendation : создает результаты ранжирования
```

- **StaffMember** — общие данные сотрудника: ID (`id`), ФИО (`fullName`) и роль (`role`). **Administrator** — администратор (`admin`), который ведет каталог и добавляет людей. **Librarian** — библиотекарь (`librarian`), который оформляет выдачу и возврат. Вход в систему и пароли в этой работе не описываем.
- **Reader** — читатель с датой рождения и интересами. Возраст вычисляется по дате рождения. Читатель видит доступные по возрасту книги, сотрудники — весь каталог. Список экземпляров со штрихкодами доступен только сотрудникам, без данных читателей.
- **Edition** — отдельный физический экземпляр издания с уникальным штрихкодом, возрастной маркировкой и статусом. Несколько экземпляров одной книги представлены разными объектами с общим `catalogRecordId`; в списке рекомендаций остается только один из них.
- **Transaction** — операция выдачи одного экземпляра одному читателю; дата возврата отсутствует до возврата. У экземпляра может быть много исторических выдач, но не более одной незакрытой одновременно.
- **Recommendation** — временный результат подбора: один читатель, один экземпляр, оценка релевантности и позиция в списке. Для одного запроса формируется от нуля до пяти результатов; хранение истории рекомендаций не требуется.
- **RecommendationService** — сервис подбора: применяет строгие фильтры, получает вектор интересов и сравнивает его с сохраненными векторами книг.

Связи выдачи и рекомендации не зависят друг от друга: рекомендация не означает, что экземпляр уже выдан или зарезервирован.
