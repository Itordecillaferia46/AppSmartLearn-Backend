const mongoose = require("mongoose");
const moment = require("moment-timezone");
const People = require("../bin/models/People");
const Notice = require("./models/Notice");
const Course = require("../bin/models/Course");
const Exercise = require("../bin/models/Exercise");
const MicroClase = require("../bin/models/MicroClase");
const ManagerMicroClases = require("../bin/models/MicroClasesA");
const Area = require("../bin/models/Area");
const School = require("../bin/models/School");
const Role = require("../bin/models/Role");
const ExerciseType = require("./models/ExerciseType");
const Resource = require("./models/Resource");
const SendExercise = require("./models/SendExercise");
const { ObjectOwnership } = require("@aws-sdk/client-s3");
const { ObjectId } = require("mongodb");
const { json } = require("body-parser");

class Controller {
    constructor() {
        this.connect();
    }

    createNotice(notice, res) {
        Notice.create(notice)
            .then(newnotice => {
                res.send({ status: 200, nU: newnotice });
                console.log("Crear en Mongodb");
            })
            .catch(err => {
                console.error(err);
                res.status(500).send("Error al crear la noticia");
            });
    }

    //READ
    getAllNotices(res) {
        Notice.find({})
            .then(notices => {
                res.send(notices);
                console.log(notices);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send("Error al obtener las noticias");
            });
    }

    deleteNotice(id, res) {
        Notice.deleteOne({ _id: id })
            .then(() => {
                res.send({ message: "Noticia eliminada" });
            })
            .catch((err) => {
                throw err;
            });
    }


    async connect() {
        try {
            await mongoose.connect(
                // "mongodb+srv://acorderofalco58:TEACHdev2021.@cluster0.3okjxa2.mongodb.net/trackapp?retryWrites=true&w=majority",
                "mongodb://acorderofalco58:TEACHdev2021.@ac-wq3ku25-shard-00-00.3okjxa2.mongodb.net:27017,ac-wq3ku25-shard-00-01.3okjxa2.mongodb.net:27017,ac-wq3ku25-shard-00-02.3okjxa2.mongodb.net:27017/trackapp?ssl=true&replicaSet=atlas-twthjd-shard-0&authSource=admin&retryWrites=true&w=majority", { useNewUrlParser: true }
            );
            console.log("conectado");
        } catch (e) {
            console.error(e);
        }
    }

    /* autenticación */
    async getAuth(people, res) {
            let { username, password } = people;

            await People.findOne({ username })
                /*  .populate({
                                path: "asignatures",
                                populate: { path: "_id_asignatura", model: "Area" },
                                populate: { path: "Actividades", populate: { path: "_id_actividad", model: "Exercise" } }
                            })*/
                .then(async(people) => {
                    console.log(people);

                    if (!people) {
                        res.status(500).send("Usuario invalido");
                    } else {
                        if (password == people.password) {
                            var r = 0;
                            var asign = [];
                            const date = await this.getActividadEstudent(people._id);

                            for (let k of date.asignatures) {
                                var v = k.Actividades.filter((ele) => {
                                    return ele._id_state == "1";
                                });

                                var obj = JSON.parse(JSON.stringify(date.asignatures[r]));

                                obj.activa = v.length;
                                asign.push(obj);
                                r += 1;
                            }
                            var final = JSON.parse(JSON.stringify(date));
                            final.asignatures = asign;
                            res.status(200).send(final);
                        } else res.status(500).send("Usuario invalido");
                    }
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).send(error);
                });
        }
        /* autenticación */

    /* area */
    setArea(area, res) {
        Area.create(area, function(err, newArea) {
            if (err) throw err;
            res.send({ status: 200, nU: newArea });
        });
    }

    getAreas(res) {
        Area.find({}, function(err, area) {
            if (err) throw err;
            res.send(area);
        });
    }

    updateArea(area, res) {
        let { id, name, code, teacher_id, course_id } = area;
        Area.updateOne({ _id: id }, {
                $set: {
                    name: name,
                    code: code,
                    teacher_id: teacher_id,
                    course_id: course_id,
                },
            })
            .then((rawResponse) => {
                res.send({ message: "Area update", raw: rawResponse });
            })
            .catch((err) => {
                if (err) throw err;
            });
    }

    deleteArea(id, res) {
            Area.deleteOne({ _id: id }, function(err) {
                if (err) throw err;
                res.send({ message: "Area has been deleted" });
            });
        }
        /* area */

    /* People */
    setPeople(people, res) {
        People.create(people, function(err, newPeople) {
            if (err) throw err;
            res.send({ status: 200, nU: newPeople });
        });
    }

    getPeoples(res) {
        People.find({}, (err, peoples) => {
            if (err) throw err;
            res.send(peoples);
        });
    }

    async getPeople(id, res) {
        await People.findOne({ _id: id.id })
            .populate({
                path: "asignatures",
                populate: { path: "_id_asignatura", model: "Area" },
                populate: {
                    path: "Actividades",
                    populate: { path: "_id_actividad", model: "Exercise" },
                },
            })
            .then((people) => {
                if (!people) {
                    res.status(500).send("Usuario invalido");
                } else {
                    res.send({ People: people });
                }
            });
    }

    updatePeople(people, res) {
        let { id, name, last_name, gender, rol, username, password } = people;
        People.updateOne({ _id: id }, {
                $set: {
                    name: name,
                    last_name: last_name,
                    gender: gender,
                    rol: rol,
                    username: username,
                    password: password,
                },
            })
            .then((rawResponse) => {
                res.send({ message: "People updated", raw: rawResponse });
            })
            .catch((err) => {
                if (err) throw err;
            });
    }

    deletePeople(id, res) {
            People.deleteOne({ _id: id }, (err) => {
                if (err) throw err;
                res.send({ message: "People has been deleted" });
            });
        }
        /* people */

    /*------------------------------------CRUD ROL------------------------------------*/
    setRole(role, res) {
        Role.create(role, function(err, newRole) {
            if (err) throw err;
            res.send({ status: 200, nU: newRole });
        });
    }

    getRoles(res) {
        Role.find({}, (err, roles) => {
            if (err) throw err;
            res.send(roles);
        });
    }

    updateRole(role, res) {
        const { id, name } = role;
        Role.updateOne({ _id: id }, { $set: { name: name } })
            .then((rawResponse) => {
                res.send({ message: "Role updated", raw: rawResponse });
            })
            .catch((err) => {
                if (err) throw err;
            });
    }

    deleteRole(id, res) {
        Role.deleteOne({ _id: id }, (err) => {
            if (err) throw err;
            res.send({ message: "Role has been deleted" });
        });
    }

    /*------------------------------------CRUD ROL------------------------------------*/

    /*------------------------------------CRUD COURSE------------------------------------*/
    //CREATE
    setCourse(course, res) {
        Course.create(course, function(err, newCourse) {
            if (err) throw err;
            res.send({ status: 200, nU: newCourse });
        });
    }

    //READ
    getCourses(res) {
        Course.find({}, (err, courses) => {
            if (err) throw err;
            res.send(courses);
        });
    }

    getCourse(id, res) {
        Course.find({ _id: id }, (err, course) => {
            if (err) throw err;
            res.send({ Course: course });
        });
    }

    //UPDATE
    updateCourse(course, res) {
        let { id, grade, group, nomenclature } = course;
        Course.updateOne({ _id: id }, { $set: { grade: grade, group: group, nomenclature: nomenclature } })
            .then((rawResponse) => {
                res.send({ message: "Course updated", raw: rawResponse });
            })
            .catch((err) => {
                if (err) throw err;
            });
    }

    //DELETE
    deleteCourse(id, res) {
            Course.deleteOne({ _id: id }, (err) => {
                if (err) throw err;
                res.send({ message: "Course has been deleted" });
            });
        }
        /*/------------------------------------CRUD COURSE/*------------------------------------*/

    /*------------------------------------CRUD EXERCISE------------------------------------*/
    //CREATE
    async setExerciseEstudiante(exercise, res) {
        const { id_actividad, people_id, archivo, id_asignatura, dia, curso } =
        exercise;

        var actua = null;

        var object = {
            people_id: people_id,
            archivo: archivo,
            nota: {
                calificacion: 0,
                observacion: "",
            },
        };
        object = JSON.parse(JSON.stringify(object));

        //var actua = await Exercise.findByIdAndUpdate({ _id: id_actividad },
        //   { $set: { 'enviados.$[stor]': object } },
        //  { arrayFilters: [{ "stor.people_id": { $eq: people_id } }] })

        actua = await Exercise.findByIdAndUpdate({ _id: id_actividad }, { $set: { "enviados.$[perf].trabajos.$[est]": object } }, {
            arrayFilters: [
                { "perf.curso": { $eq: curso } },
                { "est.people_id": { $eq: people_id } },
            ],
        });

        var result = null;
        var r1 = actua.enviados.filter((e) => {
            return e.curso == curso;
        });
        console.log("r1111111111" + JSON.stringify(r1));
        if (r1.length > 0) {
            var tr = r1[0].trabajos;
            for (var data of tr) {
                if (data.people_id == people_id) {
                    console.log("encontradddddddooooo9");
                    result = data;
                }
            }
        }

        if (r1.length == 0) {
            var estr = {
                curso: curso,
                trabajos: [],
            };
            estr.trabajos.push(object);
            actua = await Exercise.findByIdAndUpdate({ _id: id_actividad }, { $push: { enviados: estr } });
        } else {
            console.log("llego aca");

            actua = await Exercise.updateOne({ _id: id_actividad, "enviados.curso": curso }, { $push: { "enviados.$.trabajos": object } });
        }

        /*  actua = await Exercise.findByIdAndUpdate({ _id: id_actividad }, { $push: { "enviados.$[perf].trabajos": object } },
               {
               arrayFilters: [
                   { "perf.curso": { $eq: curso } },
                   
               ]
            })*/

        //  }

        // actua = await Exercise.findByIdAndUpdate({ _id: id_actividad }, { $push: { 'enviados': object } })

        // }

        /*
            var pq = {
                _id_actividad: id_actividad,
                _id_state: 2,
                dia: {
                    dias: dia.dias,
                    color: 'green',
                    avan: dia.avan
                }
            }


            console.log('alumno :' + people_id)
            console.log('asignatura :' + id_asignatura)
            console.log('actividad :' + id_actividad)
              
            var p = await People.findByIdAndUpdate({ _id: people_id }, { $set: { "asignatures.$[perf].Actividades.$[est]": pq } }, {
                arrayFilters: [
                    { "perf._id": { $eq: id_asignatura } },
                    { "est._id_actividad": { $eq: id_actividad } }
                ]
            })

           */

        res.send({ status: 200, nU: actua });
    }

    async setExercise(exercise, res) {
        var vm = this;
        var dec = moment.utc();
        //  var dec = moment()
        var fecha = dec.tz("America/Bogota").format("YYYY-MM-DD HH:mm:ss");
        let hora = dec.tz("America/Bogota").format("HH:mm:ss");
        console.log("hora :" + hora);

        var myDate = moment(
            exercise.deliveryDateInicial,
            "YYYY-MM-DD HH:mm:ss"
        ).toDate();
        myDate = moment(myDate).add(hora, "HH:mm:ss");
        myDate = moment.utc(myDate).tz("America/Bogota");
        exercise.deliveryDateInicial = myDate;

        var final = moment(
            exercise.deliveryDateFinal,
            "YYYY-MM-DD HH:mm:ss"
        ).toDate();
        final = moment(final).add("18:59:00", "HH:mm:ss");
        final = moment.utc(final).tz("America/Bogota");
        exercise.deliveryDateFinal = final;

        await Exercise.create(exercise, function(err, newActivi) {
            if (err) throw err;

            console.log(newActivi);
            vm.setActividadGrades(newActivi);

            res.send({ status: 200, nU: newActivi });
        });
    }

    //READ

    getExercises(res) {
        Exercise.find({}, (err, exercises) => {
            if (err) throw err;
            res.send(exercises);
        });
    }

    getExercise(id, res) {
        Exercise.find({ _id: id }, (err, exercise) => {
            if (err) throw err;
            res.send({ Exercise: exercise });
        });
    }

    async getExerciseDocente(id, res) {
        await Exercise.find({ people_id: id })
            .populate("task_asignature")
            .populate("topic")
            .populate({
                path: "enviados",
                populate: {
                    path: "trabajos",
                    populate: { path: "people_id", model: "People" },
                },
            })
            .then(async(exercise) => {
                res.send({ exercise });
            });
    }

    async setCalificacionExcersice(paq, res) {
            console.log("paquete" + JSON.stringify(paq));
            const { id_actividad, curso, trabajos } = paq;
            var actua = await Exercise.findByIdAndUpdate({ _id: id_actividad }, { $set: { "enviados.$[perf].trabajos": trabajos } }, {
                arrayFilters: [{ "perf.curso": { $eq: curso } }],
            });
            res.send({ actua });
        }
        /*
                      Exercise.find({ people_id: id }, (err, exercise) => {
                          if (err) throw err;
                          res.send({  exercise });
                      });
                  }
              */

    //UPDATE
    updateExercise(exercise, res) {
        let {
            id,
            task_asignature,
            topic,
            task_type,
            task_title,
            task_description,
            task_status,
            deliveryDateInicial,
            deliveryDateFinal,
            people_id,
        } = exercise;
        Exercise.updateOne({ _id: id }, {
                $set: {
                    task_asignature: task_asignature,
                    topic: topic,
                    task_type: task_type,
                    task_title: task_title,
                    task_description: task_description,
                    deliveryDateInicial: deliveryDateInicial,
                    deliveryDateFinal: deliveryDateFinal,
                    task_status: task_status,
                    people_id: people_id,
                },
            })
            .then((rawResponse) => {
                res.send({ message: "Exercise updated", raw: rawResponse });
            })
            .catch((err) => {
                if (err) throw err;
            });
    }

    //DELETE
    deleteExercise(id, res) {
            Exercise.deleteOne({ _id: id }, (err) => {
                if (err) throw err;
                res.send({ message: "Exercise has been deleted" });
            });
        }
        /*/------------------------------------CRUD EXERCISE/*------------------------------------*/

    /*------------------------------------CRUD AREA------------------------------------*/
    //CREATE
    setArea(area, res) {
        Area.create(area, function(err, newArea) {
            if (err) throw err;
            res.send({ status: 200, nU: newArea });
        });
    }

    //READ
    getArea(res) {
        Area.find({}, (err, areas) => {
            if (err) throw err;
            res.send(areas);
        });
    }

    getArea(id, res) {
        Area.find({ _id: id }, (err, area) => {
            if (err) throw err;
            res.send({ Area: area });
        });
    }

    //UPDATE
    updateArea(area, res) {
        let { id, name, creation_date } = area;
        Area.updateOne({ _id: id }, { $set: { name: name, creation_date: creation_date } })
            .then((rawResponse) => {
                res.send({ message: "Area updated", raw: rawResponse });
            })
            .catch((err) => {
                if (err) throw err;
            });
    }

    //DELETE
    deleteArea(id, res) {
            Area.deleteOne({ _id: id }, (err) => {
                if (err) throw err;
                res.send({ message: "Area has been deleted" });
            });
        }
        /*/------------------------------------CRUD AREA/*------------------------------------*/

    /*------------------------------------CRUD SCHOOL------------------------------------*/
    //CREATE
    setSchool(school, res) {
        School.create(school, function(err, newSchool) {
            if (err) throw err;
            res.send({ status: 200, nU: newSchool });
        });
    }

    //READ
    getSchools(res) {
        School.find({}, (err, schools) => {
            if (err) throw err;
            res.send(schools);
        });
    }

    getPeriod(id, res) {
        Period.find({ _id: id }, (err, period) => {
            if (err) throw err;
            res.send({ Period: period });
        });
    }

    //UPDATE
    updateSchool(school, res) {
        let { id, name, nit, courses, contact, grade, direction } = school;
        School.updateOne({ _id: id }, {
                $set: {
                    name: name,
                    nit: nit,
                    courses: courses,
                    contact: contact,
                    grade: grade,
                    direction: direction,
                },
            })
            .then((rawResponse) => {
                res.send({ message: "Period updated", raw: rawResponse });
            })
            .catch((err) => {
                if (err) throw err;
            });
    }

    //DELETE
    deleteSchool(id, res) {
            School.deleteOne({ _id: id }, (err) => {
                if (err) throw err;
                res.send({ message: "Period has been deleted" });
            });
        }
        /*/------------------------------------CRUD SCHOOL/*------------------------------------*/

    /*------------------------------------CRUD EXERCISETYPE------------------------------------*/
    //CREATE
    setExerciseType(exerciseType, res) {
        ExerciseType.create(exerciseType, function(err, newExerciseType) {
            if (err) throw err;
            res.send({ status: 200, nU: newExerciseType });
        });
    }

    //READ
    getExerciseTypes(res) {
        ExerciseType.find({}, (err, exerciseTypes) => {
            if (err) throw err;
            res.send(exerciseTypes);
        });
    }

    getPeriod(id, res) {
        Period.find({ _id: id }, (err, period) => {
            if (err) throw err;
            res.send({ Period: period });
        });
    }

    //UPDATE
    updateExerciseType(exerciseType, res) {
        let { id, topic, subtopic } = exerciseType;
        ExerciseType.updateOne({ _id: id }, { $set: { topic: topic, subtopic: subtopic } })
            .then((rawResponse) => {
                res.send({ message: "Exercise type updated", raw: rawResponse });
            })
            .catch((err) => {
                if (err) throw err;
            });
    }

    //DELETE
    deleteExerciseType(id, res) {
            ExerciseType.deleteOne({ _id: id }, (err) => {
                if (err) throw err;
                res.send({ message: "Exercise type has been deleted" });
            });
        }
        /*/------------------------------------CRUD EXERCISETYPE/*------------------------------------*/

    /*------------------------------------CRUD EXERCISETYPE------------------------------------*/
    //CREATE
    setExerciseType(exerciseType, res) {
        ExerciseType.create(exerciseType, function(err, newExerciseType) {
            if (err) throw err;
            res.send({ status: 200, nU: newExerciseType });
        });
    }

    //READ
    getExerciseTypes(res) {
        ExerciseType.find({}, (err, exerciseTypes) => {
            if (err) throw err;
            res.send(exerciseTypes);
        });
    }

    getPeriod(id, res) {
        Period.find({ _id: id }, (err, period) => {
            if (err) throw err;
            res.send({ Period: period });
        });
    }

    //UPDATE
    updateExerciseType(exerciseType, res) {
        let { id, topic, subtopic } = exerciseType;
        ExerciseType.updateOne({ _id: id }, { $set: { topic: topic, subtopic: subtopic } })
            .then((rawResponse) => {
                res.send({ message: "Exercise type updated", raw: rawResponse });
            })
            .catch((err) => {
                if (err) throw err;
            });
    }

    //DELETE
    deleteExerciseType(id, res) {
            ExerciseType.deleteOne({ _id: id }, (err) => {
                if (err) throw err;
                res.send({ message: "Exercise type has been deleted" });
            });
        }
        /*/------------------------------------CRUD EXERCISETYPE/*------------------------------------*/

    /*------------------------------------CRUD RESOURCE------------------------------------*/
    //CREATE
    setResource(resource, res) {
        Resource.create(resource, function(err, newResource) {
            if (err) throw err;
            res.send({ status: 200, nU: newResource });
        });
    }

    //READ
    getResources(res) {
        Resource.find({}, (err, resources) => {
            if (err) throw err;
            res.send(resources);
        });
    }

    getPeriod(id, res) {
        Period.find({ _id: id }, (err, period) => {
            if (err) throw err;
            res.send({ Period: period });
        });
    }

    //UPDATE
    updateResource(resource, res) {
        let { id, title, name, resource_type, people_id } = resource;
        Resource.updateOne({ _id: id }, {
                $set: {
                    title: title,
                    name: name,
                    resource_type: resource_type,
                    people_id: people_id,
                },
            })
            .then((rawResponse) => {
                res.send({ message: "Resource type updated", raw: rawResponse });
            })
            .catch((err) => {
                if (err) throw err;
            });
    }

    //DELETE
    deleteResource(id, res) {
            Resource.deleteOne({ _id: id }, (err) => {
                if (err) throw err;
                res.send({ message: "Resource type has been deleted" });
            });
        }
        /*/------------------------------------CRUD RESOURCE/*------------------------------------*/

    /*------------------------------------CRUD SEND EXERCISE------------------------------------*/
    //CREATE
    setSendExercise(sendExercise, res) {
        SendExercise.create(sendExercise, function(err, newSendExercise) {
            if (err) throw err;
            res.send({ status: 200, nU: newSendExercise });
        });
    }

    //READ
    getSendExercises(res) {
        SendExercise.find({}, (err, sendExercise) => {
            if (err) throw err;
            res.send(sendExercise);
        });
    }

    getPeriod(id, res) {
        Period.find({ _id: id }, (err, period) => {
            if (err) throw err;
            res.send({ Period: period });
        });
    }

    //UPDATE
    updateSendExercise(sendExercise, res) {
        let { id, archive, people_id, exercise_id, note } = sendExercise;
        SendExercise.updateOne({ _id: id }, {
                $set: {
                    archive: archive,
                    note: note,
                    exercise_id: exercise_id,
                    people_id: people_id,
                },
            })
            .then((rawResponse) => {
                res.send({ message: "Exercise send type updated", raw: rawResponse });
            })
            .catch((err) => {
                if (err) throw err;
            });
    }

    //DELETE
    deleteSendExercise(id, res) {
            SendExercise.deleteOne({ _id: id }, (err) => {
                if (err) throw err;
                res.send({ message: "Send Exercise type has been deleted" });
            });
        }
        /*/------------------------------------CRUD SEND EXERCISE/*------------------------------------*/

    /*------------------------ESTUDENT GRADOS ----*/

    prueba(id, res) {
        var vm = this;
        var obj = {
            state: 0,
            dias: -1,
        };

        Exercise.findOne({ _id: id }, (err, actividad) => {
            if (err) throw err;
            dec = moment.utc();
            var dec = moment();
            var fecha = dec.tz("America/Bogota").format("YYYY-MM-DD HH:mm:ss");
            var fec_actual = moment(fecha, "YYYY-MM-DD");
            var fini = moment(actividad.deliveryDateInicial, "YYYY-MM-DD").add(
                1,
                "d"
            );
            var ffin = moment(actividad.deliveryDateFinal, "YYYY-MM-DD").add(1, "d");
            var dias_activ = ffin.diff(fini, "days");
            var dias_trans = fec_actual.diff(fini, "days");

            actividad.prueba = 5;
            if (dias_trans > dias_activ) {
                obj.state = 3;
                obj.dias = dias_trans;
            } else {
                var dia_fal = dias_activ - dias_trans;
                obj.state = 1;
                obj.dias = dia_fal;
            }
        });

        return (res = obj);
    }

    async getActividadEstudent(id) {
        const data = await People.findById(id).populate({
            path: "asignatures",
            populate: {
                path: "Actividades",
                populate: { path: "_id_actividad", model: "Exercise" },
            },
        });

        for (let asignature of data.asignatures) {
            var art = [];

            //  var procesar = asignature.Actividades.filter((ele)=> {return ele._id_state == 1})
            for (let acti of asignature.Actividades) {
                console.log(acti);
                if (acti._id_state == "1" || acti._id_state == "3") {
                    dec = moment.utc();
                    var dec = moment();
                    var fecha = dec.tz("America/Bogota").format("YYYY-MM-DD HH:mm:ss");
                    var fec_actual = moment(fecha, "YYYY-MM-DD HH:mm:ss");
                    var fini = moment(
                        acti._id_actividad.deliveryDateInicial,
                        "MMMM Do YYYY, h:mm:ss a"
                    );
                    var ffin = moment(
                        acti._id_actividad.deliveryDateFinal,
                        "MMMM Do YYYY, h:mm:ss a"
                    );

                    var dias_activ = ffin.diff(fini, "days");
                    var dias_trans = ffin.diff(fec_actual, "days");

                    // 1 - pendiente
                    // 2 - enviada
                    // 3 - programada
                    // 4 - vencida
                    // 5 - calificada

                    var resp = new Object();
                    (resp._id_actividad = acti._id_actividad._id), (resp._id = acti._id);
                    resp.dia = new Object();
                    resp.dia.dias = 0;
                    resp.dia.avan = 0;
                    resp.dia.color = "white";

                    //     var fec_actual = moment(fecha).format('YYYY-MM-DD');
                    //   var fini = moment(acti._id_actividad.deliveryDateInicial,'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD');

                    if (fini > fec_actual) resp._id_state = 3;
                    else {
                        if (dias_trans < 1) {
                            resp._id_state = 4;
                            resp.dia.dias = dias_activ;
                            resp.dia.avan = dias_trans;
                            resp.dia.color = "gray";
                        } else {
                            resp._id_state = 1;
                            resp.dia.dias = dias_activ;
                            resp.dia.avan = dias_trans;
                            resp.dia.color = this.colorActividad(dias_trans);
                        }
                    }

                    art.push(resp);
                } else art.push(acti);
            }

            await People.findOneAndUpdate({ _id: id, "asignatures._id": asignature._id }, { $set: { "asignatures.$.Actividades": art } });
        }

        const datos = await People.findById(id).populate({
            path: "asignatures",
            populate: {
                path: "Actividades",
                populate: { path: "_id_actividad", model: "Exercise" },
            },
        });

        return datos;

        //  res.send(data)
    }

    colorActividad(dias) {
        if (dias == 1) return "red";
        else if (dias > 1 && dias < 4) return "orange";
        else return "yellow";
    }

    setActividadGrades(activ) {
        console.log("TOPICOS" + JSON.stringify(activ));
        for (let curso of activ.topic) {
            //People.find({ courestu: curso._id }, function(err, estudiantes) {

            People.find({ courestu: curso }, function(err, estudiantes) {
                if (err) throw err;

                if (estudiantes.length > 0) {
                    for (let estu of estudiantes) {
                        if (estu.asignatures.length == 0) {
                            const obj = {
                                _id: activ.task_asignature[0]._id,
                                Actividades: [{
                                    _id_actividad: activ._id,
                                    _id_state: 1,
                                    dia: {
                                        dias: "0",
                                        color: "white",
                                        avan: 0,
                                    },
                                }, ],
                            };
                            console.log("no tine asignaturas");
                            estu.asignatures.push(obj);
                        } else {
                            console.log("tiene asignaturas");
                            console.log(estu.asignatures);

                            var obj = estu.asignatures.find((ele) => {
                                return (
                                    JSON.stringify(ele._id._id) ===
                                    JSON.stringify(activ.task_asignature[0])
                                );
                            });

                            console.log("encotrado" + JSON.stringify(obj));
                            if (obj != undefined) {
                                let index = estu.asignatures.indexOf(obj);

                                const acti = {
                                    _id_actividad: activ._id,
                                    _id_state: 1,
                                    dia: {
                                        dias: "0",
                                        color: "white",
                                        avan: 0,
                                    },
                                };
                                console.log("sobrescrito");
                                estu.asignatures[index].Actividades.push(acti);
                            } else {
                                const obj = {
                                    _id: activ.task_asignature[0]._id._id,
                                    Actividades: [{
                                        _id_actividad: activ._id,
                                        _id_state: 1,
                                        dia: {
                                            dias: "0",
                                            color: "white",
                                            avan: 0,
                                        },
                                    }, ],
                                };
                                console.log("nuevo");
                                estu.asignatures.push(obj);
                            }
                        }

                        People.updateOne({ _id: estu._id }, { $set: { asignatures: estu.asignatures } }).then((rawResponse) => {
                            console.log("actualizado");
                        });
                    }
                }
            });
        }

        return activ;
    }

    /*------------------------ESTUDENT GRADOS ----*/
    getGabriel(id, res) {
        Exercise.find({}, (err, ejer) => {
            if (err) throw err;
            var personas = [];
            for (let i = 0; i < ejer.length; i++) {
                if (ejer[i].enviados.length > 0) {
                    for (let j = 0; j < ejer[i].enviados.length; j++) {
                        if (ejer[i].enviados[j].people_id.courestu._id == id) {
                            personas.push(ejer[i].enviados[j]);
                        }
                    }
                }
            }
            res.send(personas);
        });
    }

    //////// Aqui queda lo de micro clase //////////
    ///////////////////////////////////////////////
    async setMicroClase(micro, res) {


        MicroClase.create(micro.microclase, async function(err, newMicroClase) {
                if (err) throw err;

                for (const curso of micro.cursos) {
                    var paq = new Object()
                    paq.id_area = micro.id_area
                    paq.microclase = []

                    ManagerMicroClases.find({ id_area: ObjectId(micro.id_area) }, async function(err, area) {
                        if (err) throw err;
                        if ((area.length == 0) && (paq != null)) {
                            console.log(`curso : ${curso}`)
                            let obj = new Object()
                            obj.curso = curso,
                                obj.clases = []
                            obj.clases.push(newMicroClase._id)

                            paq.microclase.push(obj)
                            await ManagerMicroClases.create(paq, function(err, newclases) {
                                if (err) throw err;
                            })
                            paq = null
                        } else {
                            console.log(`el otro curso : ${curso}`)
                            let obj = new Object()
                            obj.curso = curso,
                                obj.clases = []
                            obj.clases.push(newMicroClase._id)

                            var r = await ManagerMicroClases.findOneAndUpdate({ id_area: ObjectId(micro.id_area), "microclase.curso": curso }, { $push: { "microclase.$.clases": newMicroClase._id } });

                            if (r == null) {
                                console.log("crea curso")
                                await ManagerMicroClases.updateOne({ id_area: ObjectId(micro.id_area) }, { $push: { "microclase": obj } });
                            }

                        }
                    })
                }



            })
            /*
            else
             {
                for (let curso of micro.cursos) {
                //    MicroClases.updateOne({ id_area: micro.id_area}, { $set: { asignatures: estu.asignatures } }).then((rawResponse) => {
                        console.log("actualizado");
                  //  });
                }
            }

              })

                                res.send({ status: 200, nU: newMicroClase });
            });*/
        res.send({ status: 200 });
    }


    setAsignaturaMicroClase(curso, res) {
            console.log(curso)
            console.log("aqui estoy")
                // ManagerMicroClases.find({ microclase: { curso: ObjectId(curso.idCurso) } }).then((response) => {
            ManagerMicroClases.find({}).then((response) => {
                let clases = []
                for (let i = 0; i < response.length; i++) {
                    for (let j = 0; j < response[i].microclase.length; j++) {
                        if (response[i].microclase[j].curso._id == curso.idCurso) {
                            clases.push(response[i])
                        }
                    }


                }
                res.send(clases);
            })
        }
        ///////// hasta aqui esta micro clase ////////
        /////////////////////////////////////////////
}
//___________________Codigo nuevo: Dev Isaac Tordecilla Feria_____________

exports.Controller = new Controller();