/**
 * Created by Tomasz on 7/16/2015.
 */
var CommanderFile = function () {
    this.title = "";
    this.size = 0;
    this.type = "";
    this.isFolder = false;
    this.pId = "";
    this.metaData = {};
};

var Commander = function () {
    var panel1 = new Panel("#panel_left");
    var panel2 = new Panel("#panel_right");
    var currentPanel = panel1;
    var destinationPanel = panel2;
    var that = this;
    this.init = function (ds) {
        //wait for datataint
        panel1.dataService = ds;
        panel2.dataService = ds;
        that.refreshBoth();
    };


    this.refreshBoth = function () {
        panel1.refresh();
        panel2.refresh();
    }

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
        console.log(event.keyCode)
        //event.preventDefault();
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

    this.disableKeyDown = function (event) {
        event.preventDefault();
    };

    this.keybind = function () {
        $(document).keydown(this.disableKeyDown);
        $(document).keyup(this.keyboardActions);
    };

    this.keybind();
};
