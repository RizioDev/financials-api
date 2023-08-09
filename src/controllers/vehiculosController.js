const { Vehicle } = require("../models/index");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

// Obtener todos los vehículos
const getVehicles = (req, res, next) => {
  Vehicle.findAll()
    .then((vehicles) => {
      res.status(200).send(vehicles);
    })
    .catch((err) => {
      next(err);
    });
};

const getVehicles0km = (req, res, next) => {
  Vehicle.findAll({ where: { estado: "nuevo" } })
    .then((vehicles) => {
      res.status(200).send(vehicles);
    })
    .catch((err) => {
      next(err);
    });
};

const getVehiculos = async (req, res, next) => {
  const { name, order } = req.query;

  try {
    let vehiculo; // Inicializar la variable vehiculo

    if (name) {
      vehiculo = await Vehicle.findAll({
        where: {
          [Op.or]: {
            id: {
              [Op.iLike]: name,
            },
            name: {
              [Op.iLike]: `%${name}%`,
            },
          },
        },
      });
    } else {
      if (!order) {
        vehiculo = await Vehicle.findAll({
          order: [["agencia", "ASC"]],
        });
      } else {
        switch (order) {
          case "PrecioLowToHigh":
            vehiculo = await Vehicle.findAll({
              order: [["precio", "ASC"]],
            });
            break;
          case "PrecioHighToLow":
            vehiculo = await Vehicle.findAll({
              order: [["precio", "DESC"]],
            });
            break;
          case "KmLowToHigh":
            vehiculo = await Vehicle.findAll({
              order: [["kilometraje", "ASC"]],
            });
            break;
          case "KmHighToLow":
            vehiculo = await Vehicle.findAll({
              order: [["kilometraje", "DESC"]],
            });
            break;
          case "nuevo": // Nuevo caso para filtrar por estado "nuevo"
            vehiculo = await Vehicle.findAll({
              where: {
                estado: "nuevo",
              },
            });
            break;
          case "usado": // Nuevo caso para filtrar por estado "nuevo"
            vehiculo = await Vehicle.findAll({
              where: {
                estado: "usado",
              },
            });
            break;
          default:
            vehiculo = await Vehicle.findAll({
              order: [["agencia", "ASC"]],
            });
            break;
        }
      }
    }

    res.status(200).json(vehiculo || []); // Retornar un array vacío si vehiculo es null o undefined
  } catch (error) {
    next(error);
  }
};

const getUsados = (req, res, next) => {
  Vehicle.findAll({ where: { estado: "usado" } })
    .then((vehicles) => {
      res.status(200).send(vehicles);
    })
    .catch((err) => {
      next(err);
    });
};
// Obtener un vehículo por su ID
const getVehicleById = (req, res, next) => {
  const { id } = req.params;
  Vehicle.findByPk(id)
    .then((vehicle) => {
      res.status(200).send(vehicle);
    })
    .catch((err) => {
      next(err);
    });
};

// Crear un nuevo vehículo
const createVehicle = async (req, res, next) => {
  const vehicle = req.body;

  try {
    const existe = await Vehicle.findOne({
      where: {
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        año: vehicle.año,
        tipo: vehicle.tipo,
        transmision: vehicle.transmision,
      },
    });

    // if (existe) {
    //   return res.status(409).send("Este vehículo ya está registrado.");
    // }

    const createdVehicle = await Vehicle.create({ ...vehicle, id: uuidv4() });

    res.status(201).send(createdVehicle);
  } catch (err) {
    next(err);
  }
};

// Actualizar un vehículo
const updateVehicle = async (req, res, next) => {
  const { id } = req.params;
  const updatedVehicle = req.body;

  try {
    if (!id) {
      return res
        .status(400)
        .send("Debe proporcionar un ID válido para actualizar el vehículo.");
    }

    const existingVehicle = await Vehicle.findByPk(id);
    if (!existingVehicle) {
      return res.status(404).send("El vehículo no existe.");
    }

    if (JSON.stringify(updatedVehicle) === "{}") {
      return res
        .status(200)
        .send("No se proporcionaron datos para actualizar el vehículo.");
    }

    if (JSON.stringify(updatedVehicle) === JSON.stringify(existingVehicle)) {
      return res
        .status(200)
        .send("No se realizó ningún cambio en el vehículo.");
    }

    await Vehicle.update(updatedVehicle, {
      where: { id },
    });

    const updatedRecord = await Vehicle.findByPk(id);

    res.status(200).send("Vehículo actualizado correctamente.");
  } catch (err) {
    next(err);
  }
};

// Eliminar un vehículo
const deleteVehicle = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res
        .status(400)
        .send("Debe proporcionar un ID válido para eliminar el vehículo.");
    }

    const existingVehicle = await Vehicle.findByPk(id);
    if (!existingVehicle) {
      return res.status(404).send("El vehículo no existe.");
    }

    await Vehicle.update(
      { disponibilidad: "vendido" },
      {
        where: { id },
      }
    );

    res.status(200).send("Vehículo eliminado correctamente.");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVehicles,
  getVehicles0km,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getUsados,
  getVehiculos,
};
