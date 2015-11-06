/**
 * Created by Tomasz on 7/16/2015.
 */
var DriveDataService = function () {

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
    var CLIENT_ID = '885369983232-b47qo0cg6cinggqgu098sclskerbvl22.apps.googleusercontent.com';

    var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive'
    ];

    /**
     * Check if current user has authorized this application.
     */
    this.checkAuth = function () {
        gapi.auth.authorize(
            {
                'client_id': CLIENT_ID,
                'scope': SCOPES,
                'immediate': true
            }, this.handleAuthResult);
    }

    /**
     * Handle response from authorization server.
     *
     * @param {Object} authResult Authorization result.
     */
    this.handleAuthResult = function (authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
            // Hide auth UI, then load client library.
            //authorizeDiv.style.display = 'none';
            loadDriveApi();
        } else {
            // Show auth UI, allowing the user to initiate authorization by
            // clicking authorize button.
            //authorizeDiv.style.display = 'inline';
        }
    }

    var initFunction = undefined;
    /**
     * Initiate auth flow in response to user clicking authorize button.
     *
     * @param {Event} event Button click event.
     */
    this.init = function (initFunc) {
        initFunction = initFunc;
        gapi.auth.authorize(
            {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
            this.handleAuthResult);
        return false;
    }


    /**
     * Load Drive API client library.
     */
    var loadDriveApi = function () {
        gapi.client.load('drive', 'v2', initialzeCommander);
    }
    var that = this;
    var initialzeCommander = function () {
        initFunction(that);
    };


    var adaptFiles = function (list) {
        var result = [];
        for (var i = 0; i < list.length; i++) {
            var driveFile = list[i];
            var cf = new CommanderFile();
            cf.pId = driveFile.id;
            cf.title = driveFile.title;

            //size
            var size = driveFile.fileSize == undefined ? "-" : driveFile.fileSize;
            cf.size = size;

            if (driveFile.mimeType == "application/vnd.google-apps.folder") {
                cf.isFolder = true;
            }

            if (!cf.isFolder) {
                cf.webLink = driveFile.webContentLink;
                cf.downloadLink = driveFile.downloadUrl;
                cf.type = driveFile.mimeType;
            }
            cf.metaData = driveFile;
            result.push(cf);
        }

        result.sort(sort_by);

        return result;
    };

    var sort_by = function (a, b) {
        var aPoints = 0;
        var bPoints = 0;
        if (a.isFolder) {
            aPoints = 2;
        }
        if (b.isFolder) {
            bPoints = 2;
        }
        if (a.title.toLowerCase() > b.title.toLowerCase()) {
            bPoints++;
        }
        if (a.title.toLowerCase() < b.title.toLowerCase()) {
            aPoints++;
        }
        return bPoints - aPoints;
    };

    this.getParentList = function (folder, callback, item) {
        if (item.metaData);
    };

    this.copyFile = function (params, cb) {
        var batch = gapi.client.newBatch();
        var itemsToCopy = params.src.getSelected();
        var destinationParent = params.dst.currentDir.pId;

        for (var i = 0; i < itemsToCopy.length; i++) {
            var file = itemsToCopy[i];
            //TODO add copy single file with rename option
            //if(itemsToCopy.length==1){
            //var newName = params.dialogValues['newName']
            // var copyTitle = newName || file.title;
            //}
            var copyTitle = file.title;
            var body = {'title': copyTitle};

            if (destinationParent) {
                body.parents = [{
                    "kind": "drive#parentReference",
                    "id": destinationParent
                }];
            }
            var request = gapi.client.drive.files.copy({
                'fileId': file.pId,
                'resource': body
            });
            batch.add(request);
        }

        batch.execute().then(cb);
    };


    /**
     * Gets files from drive for given folderId
     */
    this.getList = function (dir, callback) {
        var folder = dir.pId || dir.title;
        var retrievePageOfFiles = function (request, result) {
            request.execute(function (resp) {
                result = result.concat(resp.items);
                var nextPageToken = resp.nextPageToken;
                if (nextPageToken) {
                    request = gapi.client.drive.files.list({
                        'pageToken': nextPageToken,
                        q: "'" + folder + "' in parents"
                    });
                    retrievePageOfFiles(request, result);
                } else {
                    callback(adaptFiles(result));
                }
            });
        }
        var initialRequest = gapi.client.drive.files.list({
            q: "'" + folder + "' in parents"
        });
        retrievePageOfFiles(initialRequest, []);
    };

    this.createFolder = function (params, cb) {
        var parentdir = params.src.currentDir.pId;
        var name = params.dialogValues["folderName"];

        gapi.client.drive.files.insert({
            "title": name,
            "parents": [{"id": parentdir}],
            "mimeType": "application/vnd.google-apps.folder"
        }).then(cb);
    };

    this.delete = function (params, cb) {
        var batch = gapi.client.newBatch();
        var itemsToRemove = params.src.getSelected();
        var permanently = params.dialogValues['permanently'] == "on" ? true : false;

        for (var i = 0; i < itemsToRemove.length; i++) {
            var fileId = itemsToRemove[i].pId;
            var request;
            if (permanently) {
                var request = gapi.client.drive.files.delete({
                    'fileId': fileId
                });
            } else {
                request = gapi.client.drive.files.trash({
                    'fileId': fileId
                });
            }
            batch.add(request);
        }
        batch.execute.then(cb);
    };

    this.rename = function (params, cb) {
        var fileId = params.src.getSelected()[0].pId;
        var newTitle = params.dialogValues['newName']

        var body = {'title': newTitle};
        var request = gapi.client.drive.files.patch({
            'fileId': fileId,
            'resource': body
        });
        request.execute.then(cb);
    };
};
