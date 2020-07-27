- https://console.developers.google.com/apis/
- go to project
- enable apis and services
  - google analytics api (enable)
- credentials -> create credentials -> service account key
  - create json key, download
    - pass in as env var
- google analytics -> admin -> view user management -> add user -> service account email from json
- https://blog.logrocket.com/web-analytics-with-node-js/ for general guide

- rate limits: 10k requests per view per day
- 10 requests per second

`TECH_BY_API_KEY=<api key> TECH_BY_IMPACT_API_URL=https://api.techby.org/impact/v1/graphql npm run dev`