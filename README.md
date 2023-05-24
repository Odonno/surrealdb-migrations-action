# `surrealdb-migrations` Action

![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)

This GitHub Action installs and runs [surrealdb-migrations](https://github.com/Odonno/surrealdb-migrations).
It is used to apply migrations on a SurrealDB instance.

## Example workflow

```yaml
on: [push]

name: build

jobs:
  check:
    name: Rust project
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Install stable toolchain
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          override: true

      - name: Apply migrations
        uses: Odonno/surrealdb-migrations-action@v0.1.0
        with:
          address: "wss://cloud.surrealdb.com"
```

## Inputs

| Name                   | Required | Description                                                                                                                                                                                               | Type    | Default             |
| ---------------------- | :------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------- |
| `version`              |          | The version of `surrealdb-migrations` that will be installed.                                                                                                                                             | string  | latest              |
| `address`              |          | Address of the surrealdb instance.                                                                                                                                                                        | string  | ws://localhost:8000 |
| `ns`                   |          | Namespace to use inside the surrealdb instance.                                                                                                                                                           | string  | test                |
| `db`                   |          | Name of the database to use inside the surrealdb instance.                                                                                                                                                | string  | test                |
| `username`             |          | Username used to authenticate to the surrealdb instance.                                                                                                                                                  | string  | root                |
| `password`             |          | Password used to authenticate to the surrealdb instance.                                                                                                                                                  | string  | root                |
| `skip-untracked-files` |          | When a schema changes is made, it should create a definition file when applying migrations.<br /> If we detect untracked definition files, the CI will fail.<br /> Set to `true` to skip untracked files. | boolean | false               |

Note that you can still make use of the `.surrealdb` configuration file in your project.

## Credits

Inspired by [rust-tarpaulin](https://github.com/actions-rs/tarpaulin) GitHub Action.
