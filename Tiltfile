allow_k8s_contexts('kind-kind')
load('ext://helm_remote', 'helm_remote')
load('ext://dotenv', 'dotenv')
dotenv()

dbPassword = os.getenv('DB_PASSWORD')
dbUser = os.getenv('DB_USER')
dbName = os.getenv('DB_NAME')
dbPort = os.getenv('DB_PORT')

# ------------ postgresql ------------
helm_remote(
  'mongodb',
  repo_url='https://charts.bitnami.com/bitnami',
  values=['mongodb-values.yml']
)

k8s_resource('mongodb', port_forwards=[dbPort])
