
# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
1. Go to project directory
```
    cd skopa
```
2. Create `.env` file from sample
```
    cp .env.sample .env
```
3. Start docker
```
    docker-compose up
```

* Migrations
To use `typerom` CLI command you should use `npm`. There is a set of `typeorm:` commands which requires 2 parameters: 
1. `--component` to select proper service (e.g. core, auth, etc)
2. `--name` to set migration name you are going to `create` or `generate`
For examle: 
    ```
    npm run typeorm:create --component=core --name=AlterUsersTable
    ```

* GRPC
GRPC definitions (`.proto` files) are located in `common/grpc/_proto` directory. After you add or update GRPC definition run `yarn proto:genetate` to generate corresponding Typescript inerfaces.
You'll be able to find them in `common/grpc/interfaces`.

* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact