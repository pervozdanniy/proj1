
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
3. Update db init script permissions
```
chmod +x docker-postgresql-multiple-databases.sh
```
4. Start docker
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

## Integration ##

1. Authorization:
    Our app provides Bearer token authorization mechanism providing a pair of tokens: `access_token` and `refresh_token`. 
    There are two endpoins:
    * `POST /auth/login` - login with user credentials and get tokens pair
    * `POST /auth/refresh` - refresh tokens pair if `access_token` is expired
    
    To authorize request add header `Authorization: Bearer <access_token>`. Once token is expired you'll get `401 Unautorized` response.

2. Two-factor verification (2FA):
    Some endpoints require two-factor verification. When 2FA is required you'll get `428 Precondition required` response. It contains list of methods to be verified (e.g. email/sms). Getting 428 response also means that verification codes are already sent to user devices.
    To complete 2FA you can use one of endpoints below:
    * `POST /auth/2fa/verify` - verify all required codes at once
    * `POST /auth/2fa/verify_one` - verify one 2fa code at a time until all required codes verifed.

3. Registration:
    * `POST /auth/registration/start`

        Provide user's identification details - email and phone number and start registration session. You'll get `201 Created` response with auth tokens pair and `verify` object with required 2fa methods. 
    * `POST /auth/registration/verify`

        This is an alias to `POST /auth/2fa/verify_one` endpoint. Authorize this requiest with `access_token` from previous step.
    * `POST /auth/registration/create/agreement`

        Generate user agreement in `html` format and show it to end user.
    * `POST /auth/registration/approve/agreement`

        Send `id` from previous step response to approve user agreement.
    * `POST /auth/registration/finish`

        Provide rest of user data and become logged in with the same `access_token`

4. Deposit flow:
    Our API provides one-or-more step flow for depositing money to SKOPA account based on user's country and selected payment method. 

    * `POST /deposit/start`
        Supports several payment methods: `bank-transfer` | `credit-card` | `cash`. Provide `amount` and `currency` along with `type=<selected_payment_method>` and get one of possible responses below:

        * `action='redirect'`: 

            Follow link `redirect.url` in response. No further actions required.
        * `action='link_transfer'`: 

            Generate [Link](https://developer.link-sandbox.money/products/quickstart) widget using provided `link_transfer.sessionKey` from response. After you'll get `CUSTOMER_ID` from Link widget send it to `POST /deposit/pay_with_bank` togather with `flowId` from our API response.
        * `action='pay_with_bank'`: 

            Show user provided bank details to make a bank transfer. No further actions required.

        Also response contains `info` object with fees/conversions which are going to be charged from user.

    * `POST /deposit/pay_with_bank`

        Accepts `flowId` and some details based on `action` from previous step.

5. Withdraw flow:
    * `GET /payment_gateway/banks/account`

        List of user's added banks.
    
    * `POST /payment_gateway/banks/account`

        Add new bank to user's account.

    * `POST /withdrawal/make`

        Specify `bank_account_id` with one of user's banks `id` and `amount` to withdraw.

6. Transfer funds:
    User `POST /transfer` to transfer specified `amount` to some other SKOPA user. `receiver_id` - ID of SKOPA user. 

7. Cards management:
    * `POST /cards`

        Issue a card. `pin` is required if `is_virtual=false`
    * `POST /cards/{reference}/activate`

        Activate card. If `is_virtual=true` you can do it right after issuing. Otherwise user should wait until he gets a card. (can't be tested in sandbox)
    * `GET /cards`
    
        List all your issued cards

8. Reset password flow:

    Used for users that can't access their account

    * POST /auth/reset_password/start
    * POST /auth/reset_password/verify
    * POST /auth/reset_password/finish

9. Change password flow:

    Used by authorized user to change password for future logins. Requires `Authorization`

    * POST /auth/change_password/start
    * POST /auth/change_password/verify
    * POST /auth/change_password/finish

10. KYC

    We are using 3rd party provider to verify customers. Make a request to `POST /kyc/link` and follow `verification.url` link in response.    
    To check if KYC process is finished check for Websocket `notification` events: 
    ```
        { 
            "type": "kyc",
            "data": { "completed": boolean, "reason": string | null }
        }
    ``` 
    Or scroll trough notifications `GET /notifications/list` and find corresponsding event with `type: "kyc"`.

11. Paginated Lists
    
    For example `GET /notifications/list` or `GET /payment_gateway/transactions`.
    Paginated list request has 2 key query params: 
    * `limit`: used to specify number of records per page.
    * `search_after`: used to specify record id to scroll after. Don't send this value on first request. For further requests take this value from `last_id` field from response.

    Every response contains `has_more` boolean field to specify if there are any more records to fetch.