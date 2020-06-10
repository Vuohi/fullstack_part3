
require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')











app.use(express.json())
app.use(express.static('build'))

app.use(morgan(function (tokens, req, res) {
    morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.body(req, res)
    ].join(' ')
}))

app.use(cors())



/* let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
] */

app.use(express.static('build'))
app.use(express.json())

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
    Person
        .find({})
        .then(response => {
           res.json(response) 
        })
})

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person
        .findById(id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
    
})

app.post('/api/persons/', (req, res) => {
    
    const body = req.body
    
    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(result => {
            console.log('new person saved!')
            res.json(result)
            mongoose.connection.close()
        })

    
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(req.params.id, person, { new: true })
      .then(updatedPerson => {
     res.json(updatedPerson)
      })
      .catch(error => next(error))
  })

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
    
})

app.get('/info', (req, res) => {
    Person
        .find({})
        .then(response => {
            res.send(`<div>Phonebook has info for ${response.length} people</div></br><div>${new Date()}</div>`)
        })
})

const unknownEndpoint = (req, res) => {
 res.status(404).send({ error: 'unknown endpoint' })
  }

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}
  
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})