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
        document.addEventListener("openFileDialog", function (e) {
            $("#downloadLink").attr("href", e.detail.webLink);
            $("#openDialog").modal().on('hide.bs.modal', function (e) {
                //TODO ?
            })

        });

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
        var itemsToCopy = [];
        if (currentPanel.selectedItems.length > 0) {
            itemsToCopy = currentPanel.selectedItems;
        } else {
            itemsToCopy.push(currentPanel.getCurrentItem());
        }

        itemsToCopy.forEach(function (item) {
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

    this.keyboardActions = function (event) {
        console.log(event.keyCode);
        if (!that.modalActive) {
            event.preventDefault();
            switch (event.keyCode) {
                //f2
                case 113:
                    location.reload();
                //tab
                case 9:
                    switchPanels();
                    break;
                //f5
                case 116:
                    copySelected();
                    break;
                case 117:
                    moveRename();
                    break;
                default :
                    currentPanel.command(event.keyCode);
                    break;
            }
        }
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
