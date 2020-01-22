const express = require('express');
const db = require('./postDb')

const router = express.Router();
router.use(express.json()) 

router.get('/', (req, res) => {
  db.get()
    .then(posts=> {
      res.status(200).json(posts)
    })
    .catch(err=> {
      res.status(400).json({error: 'could not retrieve posts'})
    })
});

router.get('/:id', validatePostId, (req, res) => {
  const {id} = req.params
  db.getById(id)
    .then(post=> {
      res.status(200).json(post)
    })
    .catch(err=> {
      res.status(500).json({error: `could not retrieve post at id ${id}`})
    })
});

router.delete('/:id', validatePostId, (req, res) => {
  const {id} = req.params

  db.getById(id)
    .then( post=> 
      db.remove(id)
        .then(del => {
          if(del===1){
            res.status(200).json(post)
          }
          else {
            res.status(400).json({error: 'nothing deleted'})
          }
          
        })
        .catch(err=> {
          res.status(500).json({error: `could not delete post ${id}`})
        })
    )
    .catch(err=> {
      res.status(500).json({error: `server error`})
    })
 
});

router.put('/:id', validatePostId, (req, res) => {
  const {id} = req.params
  const changes = req.body
  db.update(id, changes)
    .then(promise => {
      if(promise===1)
        db.getById(id)
          .then(post=> {
            res.status(200).json(post)
          })
      else
          res.status(400).json({error: 'nothing changed'})
      
    })
    .catch(err=> {
      res.status(500).json({error: `could not update post ${id}`})
    })
});

// custom middleware

function validatePostId(req, res, next) {
  const { id } = req.params;
  db.getById(id)
    .then(post => {
      if (post) {
        next();
      } else {
        res.status(400).json({ message: "invalid post id" });
        // next(new Error("invalid user id" );
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'exception', err });
    });
}

module.exports = router;
