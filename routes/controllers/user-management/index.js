const {User} = require("../../../../POS/server/database/models");
const bcrypt = require("bcrypt");
const {createUserValidation} = require("./validation");

const hashIfPresent = async (password) => {
    if (!password) return undefined;
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};


// CREATE
const create = async (req, res) => {
    try {
        const {error, value} = createUserValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            return res.status(422).json({
                message: "Validation failed.",
                details: error.details.map((d) => d.message),
            });
        }

        if (value.password) value.password = await hashIfPresent(value.password);

        const user = await User.create(value);
        return res.status(201).json(user);
    } catch (err) {
        console.error(err);
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                message: "Email or username already exists.",
                details: err.errors?.map((e) => e.message),
            });
        }
        return res.status(500).json({message: "Failed to create user."});
    }
};


// GET ALL
const getAll = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limitRaw = parseInt(req.query.limit, 10) || 20;
        const limit = Math.min(Math.max(limitRaw, 1), 100);
        const offset = (page - 1) * limit;

        const users = await User.findAll({
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });

        return res.json(users);
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Failed to fetch users."});
    }
};


// GET ONE
const getOne = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({message: "User not found."});
        return res.json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Failed to fetch user."});
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const {id} = req.params;
        const data = {...req.body};

        if (data.password) data.password = await hashIfPresent(data.password);
        else delete data.password;

        const [count] = await User.update(data, {where: {id}});
        if (!count) return res.status(404).json({message: "User not found."});

        const updated = await User.findByPk(id);
        return res.json(updated);
    } catch (err) {
        console.error(err);
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                message: "Email or username already exists.",
                details: err.errors?.map((e) => e.message),
            });
        }
        return res.status(500).json({message: "Failed to update user."});
    }
};

// DESTROY
const destroy = async (req, res) => {
    try {
        const {id} = req.params;
        const count = await User.destroy({where: {id}});
        if (!count) return res.status(404).json({message: "User not found."});
        return res.json({message: "User deleted."});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Failed to delete user."});
    }
};

module.exports = {create, getAll, getOne, update, destroy};
