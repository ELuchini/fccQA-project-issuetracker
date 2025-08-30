'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = function (app, bdMockup) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let response = bdMockup.find(issue => issue.project === project);
      // res.json({project: project, issues: response ? response.data : []});
      res.json(response ? response.data : []);

    })
    
    .post(function (req, res){
      let project = req.params.project;
      
      /* { 
    "_id": "5871dda29faedc3491ff93bb",
    "issue_title": "Fix error in posting data",
    "issue_text": "When we post data it has an error.",
    "created_on": "2017-01-08T06:35:14.240Z",
    "updated_on": "2017-01-08T06:35:14.240Z",
    "created_by": "Joe",
    "assigned_to": "Joe",
    "open": true,
    "status_text": "In QA"
  }, */
      let issue_title = req.body.issue_title;
      let issue_text = req.body.issue_text;
      let created_by = req.body.created_by;
      let assigned_to = req.body.assigned_to;
      let status_text = req.body.status_text;

      if (!issue_title || !issue_text || !created_by) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newIssueData = {
        assigned_to: assigned_to || 'Unassigned',
        status_text: status_text || 'No Status',
        open: true,
        _id: uuidv4(),
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        created_on: new Date(),
        updated_on: new Date(),
      };

      let projectData = bdMockup.find(p => p.project === project);

      if (projectData) {
        // Si el proyecto ya existe, agrega el nuevo issue a su array de datos
        projectData.data.push(newIssueData);
      } else {
        // Si el proyecto no existe, crea una nueva entrada para el proyecto
        bdMockup.push({
          project: project,
          data: [newIssueData] // La data es un array que contiene el primer issue
        });
      }
      res.json(newIssueData);

    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
