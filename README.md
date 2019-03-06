# PGRM
Postgres GraphQL Relational Mapping<br>
Objective of building this is to deploy-and-forget.

### Setup
<ul>
  <li>Download Zip/Clone</li>
  <li>run command npm i/install </li>
  <li>Configure database connection in .env file as per instruction in the <b>Configuration</b> section</li>
  <li>run command npm start</li>
</ul>

### Configuration
Change the configuration to connect database in .env file
<table>
  <thead>
    <tr>
      <th>Key</th>
      <th>Value</th>
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
    <tr>
      <td>
        PG_DB_HOST
      </td>
      <td>
        127.0.0.1
      </td>
      <td>
        Database host can be changed
      </td>
    </tr>
    <tr>
      <td>
        PG_DB_PORT
      </td>
      <td>
        5432
      </td>
      <td>
        Database port can be changed
      </td>
    </tr>
    <tr>
      <td>
        PG_DB_USER
      </td>
      <td>
        postgres
      </td>
      <td>
        Database Username can be changed
      </td>
    </tr>
    <tr>
      <td>
        PG_DB_PASS
      </td>
      <td>
        <strike>postgres123</strike>
      </td>
      <td>
        Database Password can be changed
      </td>
    </tr>
    <tr>
      <td>
        PG_DB_NAME
      </td>
      <td>
        postgres
      </td>
      <td>
        Database Name can be changed
      </td>
    </tr>
  </tbody>
</table>
