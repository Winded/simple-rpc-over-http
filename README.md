# simple-rpc-over-http

Very simple RPC server and client over HTTP made with TypeScript.

An abstract interface is shared between server and client. Client
can call functions on this interface (that returns promises),
and this call is automatically sent to the server. The server
can make an implementation for this same interface.

Client is implemented with Fetch API. Server is implemented
with node.js http package.

Take a look at the example code to see it in action.

## Protocol

RPC requests are always sent with HTTP POST method. `Content-Type` is `application/json`.

Client sends a request in the following format in JSON:
 - `service`
   - Name of the service to call (string)
 - `method`
   - Method of the service to call (string)
 - `parameters`
   - Array of parameters for the method (array items can be any JSON type)
 - `session`
   - Optional session-related data (any JSON type)

Server responds in the following format in JSON:
 - `error`
   - Does not exist if no error occurred
   - If error occurred during request, contains details for the error (can be any JSON type)
 - `details`
   - Does not exist if error occurred
   - If request was successful, contains response of the RPC method
