/**
 * Created by Tomasz on 7/16/2015.
 */
var CommanderFile = function () {
    this.title = "";
    this.size = 0;
    this.type = "";
    this.isFolder = false;
    this.pId = "";
    this.downloadLink;
    this.webLink;

    this.metaData = {};
};

var Commander = function () {
    var panel1 = new Panel("#panel_left");
    var panel2 = new Panel("#panel_right");
    var currentPanel = panel1;
    var destinationPanel = panel2;
    var that = this;
    this.modalActive = false;
    this.init = function (ds) {
        panel1.dataService = ds;
        panel2.dataService = ds;

        document.addEventListener("createFolderDialog", function (e) {
            $("#createFolderDialog").on('show.bs.modal', function (event) {
                that.modalActive = true;
                var modal = $(this);
                var createFolderButton = modal.find('#createFolderButton');
                createFolderButton.on('keypress click', function (e) {
                    e.preventDefault();
                    var folderName = modal.find('#folderNameInput').val();
                    if (e.which === 13 || e.type === 'click') {
                        currentPanel.dataService.createFolder(folderName, currentPanel.currentDir,
                            that.refreshBoth);
                        $("#createFolderDialog").modal('hide');
                    }
                });
                $('#folderNameInput').focus();
            });

            $("#createFolderDialog").on('hide.bs.modal', function (event) {
                that.modalActive = false;
            });
            $("#createFolderDialog").modal();
        });
        that.refreshBoth();
    };


    this.refreshBoth = function () {
        panel1.refresh();
        panel2.refresh();
    };

    var copySelected = function () {
        getSelected().forEach(function (item) {
            currentPanel.dataService.copyFile(item, destinationPanel.currentDir, undefined, that.copyHandler);
        });
    };

    this.copyHandler = function (resp) {
        console.log('Copy ID: ' + resp.id);
        that.refreshBoth();
    };


    var moveRename = function () {
        alert("moveRename");
    };

    this.deleteHandler = function (resp) {
        console.log("fileDeleted successfully");
        that.refreshBoth();
    };

    var deleteSelected = function (pernament) {
        currentPanel.getSelected().forEach(function (item) {
            currentPanel.dataService.delete(item, pernament, that.deleteHandler);
        });
    };

    this.keyboardActions = function (event) {
        console.log(event.keyCode);
        if (!that.modalActive) {
            event.preventDefault();
            switch (event.keyCode) {
                case 113://f2
                    location.reload();
                case 9://tab
                    switchPanels();
                    break;
                case 116://f5
                    copySelected();
                    break;
                case 117:
                    moveRename();
                    break;
                case 118: //f7 create folder
                    this.createFolder();
                    break;
                case 119: //f8 delete
                    deleteSelected(false);
                    break;
                case 46: //delete pernamently
                    deleteSelected(true);
                    break;
                case 13:
                    openCurrentItem();
                    break;
                default :
                    currentPanel.command(event.keyCode);
                    break;
            }
        }
    };

    var openCurrentItem = function () {
        var currentItem = currentPanel.getCurrentItem();
        //open parent
        if (currentPanel.cursorPosition == 0) {
            if (currentPanel.parentsDirs.length != 0) {
                currentPanel.currentDir = currentPanel.parentsDirs.pop();
                currentPanel.refresh();
            } else {
                alert('root folder');
            }
            return;
        }
        //go inside  folder
        if (currentItem.isFolder) {
            currentPanel.parentsDirs.push(currentPanel.currentDir);
            currentPanel.currentDir = currentItem;
            currentPanel.refresh();
        } else {
            $("#downloadLink").attr("href", currentItem.webLink);
            $("#openDialog").modal().on('hide.bs.modal', function (e) {
                //TODO ?
            });
        }
        console.log(this.parentsDirs);
    };

    var switchPanels = function () {
        if (currentPanel == panel1) {
            currentPanel = panel2;
            destinationPanel = panel1;
        } else {
            currentPanel = panel1;
            destinationPanel = panel2;
        }

    };

    this.keyUpHandler = function (event) {
        event.preventDefault();
    };

    this.keybind = function () {
        $(document).keyup(this.keyUpHandler);
        $(document).keydown(this.keyboardActions);
    };

    this.keybind();
};
