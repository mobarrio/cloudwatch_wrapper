# cloudwatch_wrapper
Repositorio para realizar consultas a Cloudwatch via API REST utilizando AWS-SDK + NodeJS
El objetivo es que mediante una llamada HTTP podamos extraer datos de CloudWatch sin la necesidad de instalar paqueteria adisional en nuestro servidor de Zabbix.

![Esquema de conexion](https://i.imgur.com/APbQZ7e.png)

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
```
Usr admin
Psw zabbix
```

## Zabbix Demo Template
# Template Macros
```
{$BASICTOKEN}  - Token Basic para poder conectarnos a la API
{$REGION}      - Region de AWS
{$API_SERVER}  - IP y puerto en que escucha la API. Ej. http://10.1.2.100:3000
```

# LLD macros
```
{#ACCOUNT}    - Tipo de cuenta a la que estamos conectados.
{#TOKEN}      - Bearer token para poder conectarnos a la API y recolectar metricas.
{#TTL}        - TTL del Bearer token.
```

# Hosts Macros
```
{$REDISDBNAME} - ElastiCache DBName solo pare los ejemplos de monitorizacion de ElastiCache.
```

## Video
![CloudWatch](https://user-images.githubusercontent.com/1693682/88439546-cb5c3000-ce0b-11ea-88ad-36d5fd3c7e7b.gif)

## Imagenes
![Zabbix Latest Data](https://i.imgur.com/Ocp3AJI.png)

![Login](https://imgur.com/cPtpBKH.png)
![Help](https://imgur.com/2lvcW1w.png)
![API Help](https://imgur.com/rui2PkF.png)
![Get Bearer Token](https://imgur.com/FqaasZb.png)
![Verify Bearer Token](https://imgur.com/JE8INef.png)
![List Metrics](https://imgur.com/GM1pO2L.png)
![Get Metrics](https://imgur.com/vB573t7.png)

