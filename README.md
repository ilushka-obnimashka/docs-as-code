# Система учета и выдачи книг с рекомендациями

Документация библиотечной системы АС «УВК»: учет читателей и фонда, выдача и возврат книг, возрастная фильтрация и ML-рекомендации по интересам читателя.

**Автор:** Илья Трушкин

**Дисциплина:** «Основы технического документирования»

**Практикум 2:** «Работа с требованиями и диаграммами»

## Документация

- [Описание проекта и комплект документации](docs/project/overview.md).
- [Три User Stories, критерии приемки и Use Case](docs/project/requirements.md).
- [Диаграммы последовательности и классов](docs/project/diagrams.md).

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
```

Готовый сайт создается в папке `site/`, которая не включается в Git. Workflow [deploy.yml](.github/workflows/deploy.yml) проверяет сборку и публикует сайт через GitHub Pages при отправке изменений в `main` или `master`. Для публикации в настройках репозитория **Settings → Pages → Source** должен быть выбран **GitHub Actions**.

## Скриншоты

- [Локально запущенный сайт](screenshots/site.png).
- [Диаграмма последовательности](screenshots/sequence-diagram.png).
- [Диаграмма классов](screenshots/class-diagram.png).

## Структура

```text
.
├── docs/
│   ├── index.md
│   ├── project/
│   │   ├── overview.md
│   │   ├── requirements.md
│   │   └── diagrams.md
│   └── assets/
├── overrides/
├── screenshots/
├── mkdocs.yml
├── requirements.txt
└── README.md
```
