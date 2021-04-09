const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let deleteId;

suite("Functional Tests", function() {
  suite("post request test", () => {
    test("Create an issue with every field", done => {
      chai
        .request(server)
        .post("/api/issues/project")
        .send({
          issue_title: "issue",
          issue_text: "functional test",
          created_by: "Yuchan",
          assigned_to: "Chai and Mocha",
          status_text: "testing"
        })
        .end((err, res) => {
          deleteId = res.body._id;
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "issue");
          assert.equal(res.body.issue_text, "functional test");
          assert.equal(res.body.created_by, "Yuchan");
          assert.equal(res.body.assigned_to, "Chai and Mocha");
          assert.equal(res.body.status_text, "testing");
          done();
        });
    });

    test("Create an issue with only required fields", done => {
      chai
        .request(server)
        .post("/api/issues/project")
        .send({
          issue_title: "issue",
          issue_text: "functional test",
          created_by: "Yuchan",
          assigned_to: "",
          status_text: ""
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "issue");
          assert.equal(res.body.issue_text, "functional test");
          assert.equal(res.body.created_by, "Yuchan");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          done();
        });
    });

    test("Create an issue with missing required fields", done => {
      chai
        .request(server)
        .post("/api/issues/project")
        .send({
          issue_title: "issue",
          issue_text: "",
          created_by: "Yuchan",
          assigned_to: "",
          status_text: ""
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });

  suite("GET request test", () => {
    test("View issues on a project", done => {
      chai
        .request(server)
        .get("/api/issues/test")
        .query({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body[0], "_id");
          assert.property(res.body[0], "issue_title");
          assert.property(res.body[0], "issue_text");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "updated_on");
          assert.property(res.body[0], "created_by");
          assert.property(res.body[0], "assigned_to");
          assert.property(res.body[0], "open");
          assert.property(res.body[0], "status_text");
          done();
        });
    });

    test("View issues on a project with one filter", done => {
      chai
        .request(server)
        .get("/api/issues/test")
        .query({ created_by: "YI" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          res.body.forEach(result => {
            assert.equal(result.created_by, "YI");
          });
          done();
        });
    });
    
    test("View issues on a project with multiple filters", done => {
      chai
        .request(server)
        .get("/api/issues/test")
        .query({ open: true, created_by: "YI" })
        .end((err, res) => {
        assert.equal(res.status, 200);
        res.body.forEach(result => {
            assert.equal(result.open, true);
            assert.equal(result.created_by, "YI");
          });
        done();
      })
    });
    
    
  });
  
  suite("PUT request test", () => {
    test("Update one field on an issue", done => {
      chai.request(server)
      .put("/api/issues/fcc-project")
      .send({
        _id: "606f522dcf5f8014276f6349",
        issue_title: "test - updated issue title"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, "606f522dcf5f8014276f6349");
        assert.equal(res.body.result, "successfully updated");
        done();
      });
    });
    
    test("Update multiple fields on an issue", done => {
      chai.request(server)
      .put("/api/issues/fcc-project")
      .send({
        _id: "606f522dcf5f8014276f634b",
        issue_title: "test - updated issue title",
        issue_text: "test - update issue text"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, "606f522dcf5f8014276f634b");
        assert.equal(res.body.result, "successfully updated");
        done();
      });
    });
    
    test("Update an issue with missing _id", done => {
      chai.request(server)
      .put("/api/issues/fcc-project")
      .send({
        issue_title: "test - updated issue title",
        issue_text: "test - update issue text"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
    });
    
    test("Update an issue with no fields to update", done => {
      chai.request(server)
      .put("/api/issues/fcc-project")
      .send({
        _id: "606f522dcf5f8014276f634b"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body._id, "606f522dcf5f8014276f634b");
        assert.equal(res.body.error, "no update field(s) sent")
        done();
      });
    });
    
    test("Update an issue with an invalid _id", done => {
      chai.request(server)
      .put("/api/issues/fcc-project")
      .send({
        _id: "invalid",
        issue_title: "test - updated issue title",
        issue_text: "test - update issue text"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not update");
        done();
      });
    })
    
    
    
  });
  
  suite("DELETE request test", () => {
    test("Delete an issue", done => {
      chai.request(server)
      .delete("/api/issues/fcc-project")
      .send({ _id: deleteId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully deleted");
        done();
      });
    });
    
    test("Delete an issue with an invalid _id", done => {
      chai.request(server)
      .delete("/api/issues/fcc-project")
      .send({ _id: "invalid ID" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not delete");
        done();
      });
    });
    
    test("Delete an issue with missing _id", done => {
      chai.request(server)
      .delete("/api/issues/fcc-project")
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
    });
    
    
    
  });
  
  
  
});
