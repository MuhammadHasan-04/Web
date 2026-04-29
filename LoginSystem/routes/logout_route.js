
app.post('/logout', (req, res) => {
    if(req.session.user) { 
    req.session.destroy((err) => {
        if(err) {
            return res.status(500).json({ error: 'Failed to logout', details: err.message })
        }
            res.clearCookie('connect.sid')
            res.status(200).json({ message: 'Logged out successfully' })
        })
    } else {
        res.status(400).json({ error: 'No user is currently logged in' })
    }
})

