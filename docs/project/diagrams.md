# Диаграммы

Диаграммы показывают взаимодействие компонентов и основные сущности АС «УВК» в соответствии с [требованиями](requirements.md).

## Диаграмма последовательности

Диаграмма показывает **UC-01 «Получение рекомендаций книг»**. Возрастной фильтр применяется до обращения к ML-модели; выдача и резервирование не входят в этот сценарий.

```mermaid
sequenceDiagram
    actor Reader as Читатель
    participant App as АС «УВК»
    participant Catalog as Каталог
    participant Model as ML-модель рекомендаций

    Reader->>App: Запросить рекомендации(интересы)
    App->>App: Проверить интересы
    alt Интересы пустые
        App-->>Reader: Предложить заполнить интересы
    else Интересы заполнены
        App->>App: Вычислить возраст по дате рождения
        App->>Catalog: Найти доступные экземпляры с маркировкой ≤ возраст
        Catalog-->>App: Кандидаты с описаниями
        alt Кандидатов нет
            App-->>Reader: Нет доступных по возрасту книг
        else Кандидаты найдены
            App->>Model: Ранжировать(интересы, описания кандидатов)
            Note over App,Model: ФИО и дата рождения модели не передаются
            alt Ошибка или нет ответа за 5 секунд
                Note over App,Model: Ошибка вызова или истечение времени ожидания
                App-->>Reader: Рекомендации недоступны, предложить обычный поиск
            else Ответ получен
                Model-->>App: Идентификаторы и оценки релевантности
                App->>App: Проверить идентификаторы и оценки
                alt Ответ некорректен
                    App-->>Reader: Рекомендации недоступны, предложить обычный поиск
                else Ответ корректен
                    App->>App: Убрать нулевые оценки и сортировать
                                        App->>App: Объединить экземпляры одной книги, взять до 5 книг
                    alt Нет положительных оценок
                        App-->>Reader: Нет совпадений, предложить изменить интересы
                    else Рекомендации найдены
                        App-->>Reader: Названия, авторы и возрастные маркировки
                    end
                end
            end
        end
    end
```

Обычный поиск при отказе модели также применяет возрастной фильтр.

## Диаграмма классов

Диаграмма отражает учет читателей и экземпляров, операции выдачи и формирование рекомендаций.

```mermaid
classDiagram
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

    Reader "1" -- "0..*" Transaction : получает издания
    Edition "1" -- "0..*" Transaction : история выдач
    Reader "1" -- "0..*" Recommendation : получает рекомендации
    Recommendation "0..*" --> "1" Edition : рекомендует экземпляр
    RecommendationService ..> Reader : определяет возраст и интересы
    RecommendationService ..> Edition : фильтрует кандидатов
    RecommendationService ..> Recommendation : создает результаты ранжирования
```

- **Reader** — читатель с датой рождения и интересами; возраст вычисляется, а не хранится отдельным устаревающим полем.
- **Edition** — отдельный физический экземпляр издания с уникальным штрихкодом, возрастной маркировкой и статусом. Несколько экземпляров одной книги представлены разными объектами с общим `catalogRecordId`; в списке рекомендаций остается только один из них.
- **Transaction** — операция выдачи одного экземпляра одному читателю; дата возврата отсутствует до возврата. У экземпляра может быть много исторических выдач, но не более одной незакрытой одновременно.
- **Recommendation** — временный результат подбора: один читатель, один экземпляр, оценка релевантности и позиция в списке. Для одного запроса формируется от нуля до пяти результатов; хранение истории рекомендаций не требуется.
- **RecommendationService** — сервис подбора: применяет строгие фильтры и вызывает ML-модель для ранжирования оставшихся кандидатов. Взаимодействие с ML-моделью показано на диаграмме последовательности.

Связи выдачи и рекомендации не зависят друг от друга: рекомендация не означает, что экземпляр уже выдан или зарезервирован.
