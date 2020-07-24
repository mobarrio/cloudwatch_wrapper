# cloudwatch_wrapper
Repositorio para realizar consultas a Cloudwatch via API REST utilizando AWS-SDK + NodeJS


## Instalacion de Docker-Compose
```
# curl -L https://github.com/docker/compose/releases/download/1.25.4/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
# ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
# chmod 755 /usr/local/bin/docker-compose
# docker-compose --version
```

## AWS-SDK Credentials
`El acceso se realiza via el archivo de credenciales.`

```
# cat /root/.aws/credentials
[default]
aws_access_key_id = [ACCESS_KEY]
aws_secret_access_key = [SECRET_KEY]

[pro]
aws_access_key_id = [ACCESS_KEY]
aws_secret_access_key = [SECRET_KEY]

[pre]
aws_access_key_id = [ACCESS_KEY]
aws_secret_access_key = [SECRET_KEY]

[dev]
aws_access_key_id = [ACCESS_KEY]
aws_secret_access_key = [SECRET_KEY]
```


## Compilar y arrancar el contenedor
```
# docker-compose build
# docker-compose up -d
```


## Parar el contenedor
```
# docker-compose down


```
## Generar clave RSA 256
```
# ssh-keygen -t rsa -b 4096 -m PEM -f config/jwtRS256.key
```


## Usuarios y Password
**Usr:** admin
**Psw:** zabbix
