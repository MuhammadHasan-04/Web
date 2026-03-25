app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = new User(username, password)
        if(await user.register()){
            res.status(201).json({ message: `${user.username} registered successfully` })
            console.log(`${user.username} registered successfully`);
        }
        else{
            res.status(400).json({ error: 'User already exists' })
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to register user', details: err.message })
    }
})
