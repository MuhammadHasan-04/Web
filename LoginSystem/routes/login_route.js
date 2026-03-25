app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const userInstance = new User(username, password)
        
        const loggedUser = await userInstance.login()
        console.log('Attempting login for:', loggedUser)
        if(loggedUser) {
            req.session.user = loggedUser
            req.session.save((err) => {
                if(err) {
                    return res.status(500).json({ error: 'Failed to create session', details: err.message })
                }
                res.status(200).json({ message: `${loggedUser.username} logged in successfully`, sessionId: req.sessionID })
                req.session.user = loggedUser;
            })
        } else {
            res.status(401).json({ error: 'Invalid credentials' })
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to login user', details: err.message })
    }
})
