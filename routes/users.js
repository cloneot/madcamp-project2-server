const router = require('express').Router();

router.get('/test', (req, res) => {
	console.log(req);
	return res.json([{id: 17, username: "junseo"}]);
});

// router.route('/users/:id').get((req, res) => {

// });

module.exports = router;
