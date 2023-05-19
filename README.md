
# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

## How do I get set up? ##

### Summary of set up ###
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

### Migrations ###
To use `typerom` CLI command you should use `npm`. There is a set of `typeorm:` commands which requires 2 parameters: 
1. `--component` to select proper service (e.g. core, auth, etc)
2. `--name` to set migration name you are going to `create` or `generate`
For example: 
    ```
    npm run typeorm:create --component=core --name=AlterUsersTable
    ```

### GRPC ###
GRPC definitions (`.proto` files) are located in `common/grpc/_proto` directory. After you add or update GRPC definition run `yarn proto:genetate` to generate corresponding Typescript inerfaces.
You'll be able to find them in `common/grpc/interfaces`.

* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

## How to test it ##
1. Registration flow:
    * POST /auth/registration/start
    * POST /auth/registration/verify
        (on local version get code from logs of auth service)
    * POST /auth/registration/create/agreement
    * POST /auth/registration/approve/agreement
        (just paste id from previous step's response)
    * POST /auth/registration/finish

2. Deposit flow:
    * POST /deposit/start
        * case `action='redirect'`: 
            follow link `redirect.url` in response
        * case `action='link_transfer'`: 
            there is no way to process this flow without frontend part
        * case `action='pay_with_bank'`: 
            pay with provided bank details

3. Withdraw flow:
    * GET /payment_gateway/banks/account

        Check if you have any banks. If yes copy `id` of chosen one.
    
    * POST /payment_gateway/banks/account

        If there is no banks added, add one and copy it's `id`

    * POST /withdrawal/make

        Set `bank_account_id: id_from_prev_step`

4. Cards management:
    * POST /cards

        Issue a card. Pin is required if `is_virtual=false`
    * POST /cards/{reference}/activate

        Activate card. If `is_virtual=true` you can do it right after issuing. Otherwise user should wait until he gets a card. (can't be tested in sandbox)
    * GET /cards
    
        List all your issued cards
