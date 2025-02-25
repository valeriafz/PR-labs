# Network programming explored concepts
All laboratories are available via docker containers. 
## Lab 1
Lab 1 scrapes the products from a local shop through TCP sockets and serializez it into xml and json formats, applying first some validators and filtering the price range. It furthermore sends this data to a RabbitMQ message processor which comes into place in Lab 3. 

## Lab 2
It creates a connection between a MySQL database to the serialized data from lab 1. 
Each product can be then updated, deleted or in fact, created from scratch, according to the specific route endpoint, also uploading a file as multipart/form-data. Via a TCP server and a separate worker thread, the user can create write/read commands in the data folder, which will be automatically be executed into a shared resources text file. 
A simple chat has been implemented via web sockets to explore the concepts of joining/leaving a room and sending messages.

## Lab 3
It creates the connection between the database and RabbitMQ for the message queue through a UDP server. A leader election algorithm takes place, multiple manager containers joining the multicast group until one is decided as the leader and is the one who actually goes on to initialize the connection with RabbitMQ. 
