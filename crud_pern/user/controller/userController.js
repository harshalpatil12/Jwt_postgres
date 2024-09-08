const asyncHandler = require('express-async-handler')
const userModel = require("../model/userModel")
const bcrypt = require("bcrypt");

const jwtSecret = "09d25e094faa6ca2556c8181peiBi2UvRd1usgGch6AVWHDEwxrw4j3b88e8d3e7";
const jwt = require('jsonwebtoken');
//JWT-REDIS
const jwtRedis = require('jwt-redis').default;
const { createClient } = require('redis');
const redisClient = createClient();

redisClient.on('error', (err) => {
    console.error({ message: `Redis connection error`, badge: true })
});

redisClient.on('ready', () => {
    console.info({ message: `Redis client is ready`, badge: true })
});

redisClient.on('reconnecting', () => {
    console.info({ message: `Reconnecting to Redis`, badge: true })
});

(async () => {
    try {
        await redisClient.connect();
        console.log({ message: `Connected to Redis`, badge: true })
    } catch (error) {
        console.error({ message: `'Error connecting to Redis`, badge: true })
        console.error('Error connecting to Redis:', error);
        process.exit(1);
    }
})();

const jwtr = new jwtRedis(redisClient);


const createUser = asyncHandler(async (req, res) => {
    const { firstname, lastname, username, password } = req.body;

    if (!firstname || !lastname || !username || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await userModel.create({
            firstname,
            lastname,
            username,
            password: hashedPassword
        });
        res.status(200).json("User created successfully");
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


const getUser = asyncHandler(async (req, res) => {
    const userId = req.params.id
    const getNewUser = await userModel.findByPk(userId);

    res.status(200).json(getNewUser)
})

const getAllUser = asyncHandler(async (req, res) => {
    const getALLNew = await userModel.findAll()

    res.status(200).json(getALLNew)
})

const getDestroy = asyncHandler(async (req, res) => {
    const userId = req.query.id
    const userDestroy = await userModel.findByPk(userId)

    await userDestroy.destroy()

    res.status(200).json("userDeleted ")
})

//@desc Login user
//@route POST /users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const user = await userModel.findOne({ raw: true, where: { username: username } });

    //compare password with hashedpassword
    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = await jwtr.sign(
            {
                user: {
                    username: user.username,
                    id: user.id,
                },
            },
            jwtSecret,
            { expiresIn: '3d' }
        );
        console.log("Token........................", accessToken)
        try {
            success({ message: "User logged in successfully..!", badge: true });
            return res.status(200).json({
                access_token: accessToken,
                token_type: "bearer",
                user_id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
            });
        } catch (sessionError) {
            return res.status(200).json({
                message: "Login successful, but failed to create session.", access_token: accessToken,
                token_type: "bearer",
                user_id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
            });
        }
    } else {
        error({ message: "Username or Password is not valid", badge: true });
        return res.status(401).json({ message: "Username or Password is not valid" });
    }
});


// Logout endpoint
const logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.decode(token); // Decode token to extract jti
        const jti = decodedToken.jti;
        console.log('### jti ### ', jti);

        // Destroy token in Redis
        await jwtr.destroy(jti);

        console.log('User logout successfully..!'); // Log the success message to the console

        return res.status(200).json({ message: 'Logout successfully' });

    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = {
    createUser,
    getUser,
    getAllUser,
    getDestroy,
    loginUser,
    logoutUser
}