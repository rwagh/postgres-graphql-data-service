# PGRM
Postgres GraphQL Relational Mapping<br>
Objective of building this is to deploy-and-forget.

### Configuration
Change the configuration to connect database in .env file
<table>
  <thead>
    <tr>
      <th>Key</th>
      <th>Value<th>
      <th>Comments</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        SERVICE_PORT
      </td>
      <td>
        9002
      </td>
      <td>
        Port can be changed
      </td>
    </tr>
    <tr>
      <td>
        SERVICE_ENDPOINT
      </td>
      <td>
        /pgrm
      </td>
      <td>
        Endpoint can be changed
      </td>
    </tr>
  </tbody>
</table>
PG_DB_HOST = 127.0.0.1
##### Change the database host here
PG_DB_PORT = 5432
##### Change the database port here
PG_DB_USER = postgres
##### Change the database user of your database
PG_DB_PASS = postgres123
##### Change the database password here
PG_DB_NAME = postgres
##### Change the database name here
