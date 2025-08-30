'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = function (app, bdMockup) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let projectData = bdMockup.find(issue => issue.project === project);
      
      if (!projectData) {
        return res.json([]);
      }

      let filteredIssues = projectData.data;
      let filters = req.query;

      for (const key in filters) {
        if (Object.hasOwnProperty.call(filters, key)) {
          filteredIssues = filteredIssues.filter(issue => {
            // Handle boolean 'open' field specifically
            if (key === 'open') return issue.open === (filters[key] === 'true');
            // For other fields, weak comparison is fine as in the original code
            return issue[key] == filters[key];
          });
        }
      }
      res.json(filteredIssues);

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
        return res.json({ error: 'required field(s) missing' });//Entregaba codigo de error 400, pero para los tests de fcc necesita 200.
      }

      const newIssueData = {
        assigned_to: assigned_to || '', //Es requisito que sea una cadena vacía. 
        status_text: status_text || '', //Es requisito que sea una cadena vacía. 
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
      const { _id, issue_title, issue_text, assigned_to, status_text, open } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Verifica si se envió al menos un campo para actualizar
      if (issue_title === undefined && issue_text === undefined && assigned_to === undefined && status_text === undefined && open === undefined) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      let projectData = bdMockup.find(p => p.project === project);
      if (!projectData) {
        return res.json({ error: 'could not update', '_id': _id });
      }

      let issue = projectData.data.find(i => i._id === _id);
      if (!issue) {
        return res.json({ error: 'could not update', '_id': _id });
      }

      // Aplica las actualizaciones. Esta lógica es más segura que usar `||`
      // porque permite actualizar a valores como "" (string vacío) o `false`.
      if (issue_title !== undefined) issue.issue_title = issue_title;
      if (issue_text !== undefined) issue.issue_text = issue_text;
      if (assigned_to !== undefined) issue.assigned_to = assigned_to;
      if (status_text !== undefined) issue.status_text = status_text;
      if (open !== undefined) issue.open = open;

      // Actualiza la fecha de modificación
      issue.updated_on = new Date();

      return res.json({ result: 'successfully updated', '_id': _id });

    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      let projectData = bdMockup.find(p => p.project === project);
      if (!projectData) {
        return res.json({ error: 'could not delete', '_id': _id });
      }
      let issueIndex = projectData.data.findIndex(i => i._id === _id);
      if (issueIndex === -1) {
        return res.json({ error: 'could not delete', '_id': _id });
      }
      projectData.data.splice(issueIndex, 1);
      return res.json({ result: 'successfully deleted', '_id': _id });
     });
    
};
