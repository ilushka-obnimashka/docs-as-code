# Система учета и выдачи книг с рекомендациями

Документация библиотечной системы АС «УВК»: учет читателей и фонда, выдача и возврат книг, возрастная фильтрация и ML-рекомендации по интересам читателя.

**Автор:** Илья Трушкин

**Дисциплина:** «Основы технического документирования»

**Практикум 2:** «Работа с требованиями и диаграммами»

**Практикум 3:** «Документирование API»

## Документация

- [Описание проекта и комплект документации](docs/project/overview.md).
- [Три User Stories, критерии приемки и Use Case](docs/project/requirements.md).
- [Диаграммы последовательности и классов](docs/project/diagrams.md).
- [API: восемь операций, права доступа, ошибки и схемы](docs/api/index.md).
- [Спецификация OpenAPI 3.0.3](docs/api/openapi.yaml).

После запуска сайта откройте `/api/` для описания ручек и `/api/swagger.html` для просмотра в Swagger UI. Swagger включен в проект и работает без внешнего CDN. Реального сервера нет, поэтому отправка запросов отключена.

Диаграммы написаны на Mermaid. На сайте доступны изменение масштаба, отображение по ширине и полноэкранный просмотр. Библиотека Mermaid включена в репозиторий; загрузка диаграмм не требует доступа к внешнему CDN.

## Локальный запуск

Требуется Python 3.12. Выполняйте команды из корня репозитория `docs-as-code`.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m mkdocs serve
```

Откройте <http://127.0.0.1:8000/>. При изменении документации страница обновляется автоматически. Для остановки сервера нажмите `Ctrl+C`.

## Проверка сборки

```sh
.venv/bin/python -m mkdocs build --strict
.venv/bin/python -m openapi_spec_validator docs/api/openapi.yaml
```

Готовый сайт создается в папке `site/`, которая не включается в Git. Workflow [deploy.yml](.github/workflows/deploy.yml) проверяет сборку и публикует сайт через GitHub Pages при отправке изменений в `main` или `master`. Для публикации в настройках репозитория **Settings → Pages → Source** должен быть выбран **GitHub Actions**.

## Скриншоты

- [Локально запущенный сайт](screenshots/site.png).
- [Диаграмма последовательности](screenshots/sequence-diagram.png).
- [Диаграмма классов](screenshots/class-diagram.png).
- [Swagger UI: раскрытая операция рекомендаций](screenshots/practice-3-swagger.png).
- [Страница API в документации](screenshots/practice-3-api.png).

## Структура

```text
.
├── docs/
│   ├── index.md
│   ├── project/
│   │   ├── overview.md
│   │   ├── requirements.md
│   │   └── diagrams.md
│   ├── api/
│   │   ├── index.md
│   │   ├── openapi.yaml
│   │   └── swagger.html
│   └── assets/
├── overrides/
├── screenshots/
├── mkdocs.yml
├── requirements.txt
└── README.md
```
