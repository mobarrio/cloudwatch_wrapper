# cloudwatch_wrapper
Repositorio para realizar consultas a Cloudwatch via API REST utilizando AWS-SDK + NodeJS


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
