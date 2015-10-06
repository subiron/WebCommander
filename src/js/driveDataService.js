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
            cf.type = driveFile.mimeType;
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

    /**
     * Copy
     *
     * @param {String} originFileId ID of the origin file to copy.
     * @param {String} copyTitle Title of the copy.
     */
    this.copyFile = function (file, destination, newName, callback) {
        var destinationParent = destination.pId;
        var copyTitle = newName || file.title;
        var body = {'title': copyTitle};
        if (destinationParent) {
            body.parents = [{


                "kind": "drive#parentReference",
                "id": destinationParent


            }];
            //body.parents.push();
        }
        console.log("copy to: " + destination.title + " : " + destination.pId);

        var request = gapi.client.drive.files.copy({
            'fileId': file.pId,
            'resource': body
        });
        request.execute(callback);
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
    }
};
