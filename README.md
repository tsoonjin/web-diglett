# Setup

## Pre-requisites

- Docker
- [Tilt](https://docs.tilt.dev/)
- Helm

## Cluster Setup

- `sh scripts/01-cluster-setup.sh`
- To switch to kind cluster just do, `kubectl config use-context kind-kind`

# OpenFaas

## Pre-requisites

- Obtain login info for Openfaas via, `arkade info openfaas`
- Run `faas-cli login`
- Ensure that `docker login` is performed
- Replace image username in `stack.yaml` with your docker's username

# Development

## Basic Auth

- Create username: `faas-cli secret create service-username --from-literal="joe"`
- Create password:

```
faas-cli secret create service-username --from-literal="joe"
export PASSWORD=tomorrownojoe
# export PASSWORD=$(head -c 16 /dev/urandom | shasum | cut -d" " -f1)
echo $PASSWORD
echo -n $PASSWORD | faas-cli secret create service-password

```

- `curl http://localhost:8080/function/web-diglett --basic --user=joe:tomorrownojoe`

# Deployment local

- Run `kubectl port-forward svc/gateway -n openfaas 8080:8080`. Change to another port if not available i.e. 8888:8080
- `sh scripts/openfaas-deploy.sh`
- Run `tilt up`

# Resources

- [Openfaas Web Scraper](https://www.openfaas.com/blog/puppeteer-scraping/)
- [Openfaas basic auth](https://github.com/openfaas-incubator/openfaas-function-auth)
- [OpenFaas NATs for pub/sub](https://github.com/openfaas/nats-connector)
