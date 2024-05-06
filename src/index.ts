import { Elysia, t } from "elysia";
import { PrismaClient } from '@prisma/client'
import { swagger } from '@elysiajs/swagger'

const db = new PrismaClient()
const app = new Elysia()

.model({ 
  'sign.up': t.Object({ 
      username: t.String(), 
      password: t.String({ 
          minLength: 8
      }) 
  }) 
})

.model({ 
  'user.update': t.Object({ 
      username: t.String(), 
  }) 
})


.use(swagger()) 

// create
.post(
  '/sign-up', 
  async ({ body }) => db.user.create({
      data: body,
      select: { 
        id: true, 
        username: true
    } 
  }),
  { 
    error({ code,error }) {  
      switch (code) {  
          case 'P2002':  
              return { 
                  error: 'Username must be unique'
              }  
          case 'VALIDATION':  
          return {
            error: error.validator.Errors(error.value).First().message
          } 
   
      }  
  },  
      body: 'sign.up',
  } 
)

// update data
.put("/user/:id",async ({params, body }) => db.user.update({
  where: { id: parseInt(params.id)},
  data: { username:body.username},
}),
{ 
error({ code,error }) {  
  switch (code) {  
      case 'P2002':  
          return { 
              error: 'Username must be unique'
          }  
      case 'P2025':  
          return { 
              error: 'User not found'
          }  
      case 'VALIDATION':  
      return {
        error: error.validator.Errors(error.value).First().message
      } 

  }  
},  
  body: 'user.update',
} 
)


// get list
.get(
  '/users', 
  await db.user.findMany(),
)

// delete data
.delete("/user/:id",async ({params}) => db.user.delete({
  where: { id: parseInt(params.id)},
  select: { 
    id: true, 
    username: true
}
}),
{
  error({ code }) {  
    switch (code) {  
        case 'P2025':  
            return { 
                error: 'User not found'
            } 
    }  
  },
}

)
.listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
