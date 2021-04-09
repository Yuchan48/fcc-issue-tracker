"use strict";
var expect = require("chai").expect;
let mongodb = require("mongodb");
let mongoose = require("mongoose");

module.exports = function(app) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  let issueSchema = new mongoose.Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    open: { type: Boolean, required: true },
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
    project: String
  });

  let Issue = mongoose.model("Issue", issueSchema);

  app
    .route("/api/issues/:project")

    .get(function(req, res) {
      let project = req.params.project;
      let queryObj = Object.assign(req.query);
      queryObj.project = project;

      Issue.find(queryObj, (err, arrayObj) => {
        if (!err && arrayObj) {
          return res.json(arrayObj);
        }
      });
    })

    .post(function(req, res) {
      let project = req.params.project;

      if (
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        return res.json({ error: "required field(s) missing" });
      }

      let newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        open: true,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        project: project //req.params.project
      });

      newIssue.save((err, savedIssue) => {
        if (!err && savedIssue) {
          return res.json(savedIssue);
        }
      });
    })

    .put(function(req, res) {
      let project = req.params.project;
      let updatedObject = {};

      Object.keys(req.body).forEach(key => {
        if (req.body[key] != "") {
          updatedObject[key] = req.body[key];
          updatedObject.updated_on = new Date().toUTCString();
        }
      });

      if (!req.body._id) {
        return res.json({ error: "missing _id" });
      }

      if (
        !req.body.issue_title &&
        !req.body.issue_text &&
        !req.body.created_by &&
        !req.body.assigned_to &&
        !req.body.status_text &&
        !req.body.open
      ) {
        return res.json({
          error: "no update field(s) sent",
          _id: req.body._id
        });
      }

      
      Issue.findByIdAndUpdate(
        req.body._id,
        updatedObject,
        { new: true },
        (err, updatedIssue) => {
          if (err || !updatedIssue) {
            return res.json({ error: "could not update", _id: req.body._id });
          } else {
            return res.json({
              result: "successfully updated",
              _id: req.body._id
            });
          }
        }
      );
    })

    .delete(function(req, res) {
      let project = req.params.project;

      if (!req.body._id) {
        return res.json({ error: "missing _id" });
      }

      Issue.findByIdAndRemove(req.body._id, (err, deletedIssue) => {
        if (err || !deletedIssue) {
          return res.json({ error: "could not delete", _id: req.body._id });
        } else {
          return res.json({
            result: "successfully deleted",
            _id: req.body._id
          });
        }
      });
    });
};
