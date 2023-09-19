import { app } from './app'
import { env } from './env'

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('listen on the port 3333')
  })
