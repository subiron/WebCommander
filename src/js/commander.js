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
        that.refreshBoth();
    };

    this.refreshBoth = function () {
        panel1.refresh();
        panel2.refresh();
    };

    var copySelected = function () {
        var dialogData = {
            dialogName: "copy",
            focusOnSelector: "",
            action: currentPanel.dataService.copyFile,
            reaction: that.copyHandler,
            params: {
                src: currentPanel,
                dst: destinationPanel,
                dialogValues: {}
            }
        };
        createDialog(dialogData);
    };

    this.copyHandler = function (resp) {
        console.log('Copy ID: ' + resp.id);
        that.refreshBoth();
    };

    var isPanelsLocationTheSame = function () {
        return panel1.currentDir === panel2.currentDir;
    };

    var moveRename = function () {
        //rename only... for now
        var dialogData = {
            dialogName: "rename",
            focusOnSelector: "#renameInput",
            action: currentPanel.dataService.rename,
            reaction: that.refreshBoth,
            params: {
                src: currentPanel,
                dst: destinationPanel,
                dialogValues: {}
            }
        };
        createDialog(dialogData);
    };

    var createFolder = function () {
        var dialogData = {
            dialogName: "createFolder",
            focusOnSelector: "#folderNameInput",
            action: currentPanel.dataService.createFolder,
            reaction: that.refreshBoth,
            params: {
                src: currentPanel,
                dst: destinationPanel,
                dialogValues: {}
            }
        };
        createDialog(dialogData);
    };

    var deleteSelected = function () {
        var dialogData = {
            dialogName: "delete",
            focusOnSelector: "#permanentCheckbox",
            action: currentPanel.dataService.delete,
            reaction: that.refreshBoth,
            params: {
                src: currentPanel,
                dst: destinationPanel,
                dialogValues: {}
            }
        };
        createDialog(dialogData);
    };

    var createDialog = function (dialogData) {
        if (that.modalActive) {
            return;
        }

        $("#" + dialogData.dialogName + "Dialog").on('show.bs.modal', function (event) {
            that.modalActive = true;
            var modal = $(this);
            var confirmButton = modal.find('button[name="confirm"]');

            var cleanup = modal.find("input");
            for (var i = 0; i < cleanup.length; i++) {
                //exclude by name for now(default values will be stored in setting later)
                if (cleanup[i].name == "permanently") {
                    continue;
                }
                cleanup[i].value = "";
            }

            confirmButton.on('keypress click', function (e) {
                e.preventDefault();
                if (e.which === 13 || e.type === 'click') {
                    // get all input values from dialog
                    var dialoginputs = modal.find("input");
                    for (var i = 0; i < dialoginputs.length; i++) {
                        dialogData.params.dialogValues[dialoginputs[i].name] = dialoginputs[i].value;
                    }
                    //execute command
                    console.log("creating a folder...");
                    dialogData.action(dialogData.params, dialogData.reaction);
                    $("#" + dialogData.dialogName + "Dialog").modal('hide');
                }
            });

            if (dialogData.focusOnSelector == dialogData.focusOnSelector || dialogData.focusOnId) {
                dialogData.focusOnSelector = 'button[name="confirm"]';
            }
            $(dialogData.focusOnSelector).focus();
        });

        $("#" + dialogData.dialogName + "Dialog").on('hide.bs.modal', function (event) {
            that.modalActive = false;
            //remove listeners
            var modal = $(this);
            var confirmButton = modal.find('button[name="confirm"]');
            confirmButton.off("keypress click");
            $("#" + dialogData.dialogName + "Dialog").off('show.bs.modal');
        });


        $("#" + dialogData.dialogName + "Dialog").modal();
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
                case 117: //f6 rename/move
                    moveRename();
                    break;
                case 118: //f7 create folder
                    createFolder();
                    break;
                case 119: //f8 delete
                    deleteSelected();
                    break;
                case 46: //delete permanently
                    deleteSelected();
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