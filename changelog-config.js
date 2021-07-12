'use strict'
const config = require('conventional-changelog-conventionalcommits');

module.exports = config({
    types: [
        {type: "feat", section: "Features", "hidden": false},
        {type: "fix", section: "Bug Fixes", "hidden": false},
        {type: "chore", section:"Others", "hidden": true},
        {type: "revert", section:"Reverts", "hidden": true},
        {type: "improvement", section: "Feature Improvements", "hidden": false},
        {type: "docs", section:"Docs", "hidden": true},
        {type: "style", section:"Styling", "hidden": true},
        {type: "refactor", section:"Code Refactoring", "hidden": false},
        {type: "perf", section:"Performance Improvements", "hidden": false},
        {type: "test", section:"Tests", "hidden": true},
        {type: "build", section:"Build System", "hidden": true},
        {type: "ci", section:"CI", "hidden":true}
        ],
    issuePrefixes: ["COLAB-", "ERP-", "BUGS-"],
    issueUrlFormat: "https://24so.atlassian.net/browse/{{prefix}}{{id}}"
})