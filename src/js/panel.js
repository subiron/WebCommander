/**
 * Created by Tomasz on 7/16/2015.
 */
var Panel = function (id) {
    this.itemsNum = 0;
    this.cursorPosition = 0;
    this.panel = $(id);
    this.selectedItems = [];
    this.currentDir = new CommanderFile();
    this.currentDir.isFolder = true;
    this.currentDir.title = "root";
    this.parentsDirs = [];

    this.dataService = undefined;
    var that = this;
    this.fileList = [];
    this.refresh = function () {
        this.dataService.getList(this.currentDir, this.drawFiles);
    };

    this.getCurrentItem = function () {
        return this.fileList[this.cursorPosition];
    };

    this.drawFiles = function (_fileList) {
        _fileList.unshift({title: '..'});
        that.fileList = _fileList;
        that.itemsNum = that.fileList.length;
        var trHTML = '';
        that.panel.empty();
        $.each(that.fileList, function (i, item) {
            trHTML += '<tr><td>' + item.title + '</td><td>' + item.size + '</td><td>' + item.type + '</td></tr>';
        });
        that.panel.append(trHTML);
        that.cursorPosition = 0;
        that.moveCursor(0);
    };

    this.open = function () {
        var currentItem = this.getCurrentItem();
        //open parent
        if (this.cursorPosition == 0) {
            if (this.parentsDirs.length != 0) {
                this.currentDir = this.parentsDirs.pop();
                this.refresh();
            } else {
                alert('root folder');
            }
            return;
        }
//go inside  folder
        if (currentItem.isFolder) {
            this.parentsDirs.push(this.currentDir);
            this.currentDir = currentItem;
            this.refresh();
        } else {
            var event = new CustomEvent("openFileDialog", {"detail": currentItem});
            document.dispatchEvent(event);

        }
        console.log(this.parentsDirs);
    };

    this.select = function () {
        console.log(this.selectedItems);

        var index = this.selectedItems.indexOf(this.cursorPosition);
        var cssindex = this.cursorPosition + 1;
        if (index > -1) {
            this.selectedItems.splice(index, 1); //remove from array
            this.panel.find('tr:nth-child(' + cssindex + ')').removeClass("selectedRow");
            this.moveCursor(1);
        } else {
            this.selectedItems.push(this.cursorPosition);
            this.panel.find('tr:nth-child(' + cssindex + ')').addClass("selectedRow");
            this.moveCursor(1);
        }
        console.log(this.selectedItems);
    };

    this.command = function (key) {
        switch (key) {
            case 40:
                this.moveCursor(1);
                break;
            case 38:
                this.moveCursor(-1);
                break;
            case 36:
                this.cursorPosition = 0;
                this.moveCursor(0);
                break;
            case 35:
                this.cursorPosition = this.itemsNum - 1;
                this.moveCursor(0);
                break;
            case 33:
                //todo CHANGE TO 'PAGINATION'
                this.cursorPosition = 0;
                this.moveCursor(0);
                break;
            case 34:
                //todo CHANGE TO 'PAGINATION'
                this.cursorPosition = this.itemsNum - 1;
                this.moveCursor(0);
                break;
            case 45:
                this.select();
                break;
            case 13:
                this.open();
                break;
        }
    };

    this.moveCursor = function (num) {
        if (!((this.cursorPosition + num < 0) || (this.cursorPosition + num > this.itemsNum - 1))) {
            this.cursorPosition = num + this.cursorPosition;
            this.panel.find('.currentRow').removeClass("currentRow");
            var z = this.cursorPosition + 1;
            this.panel.find('tr:nth-child(' + z + ')').addClass("currentRow");
            this.setCursorInView();
            console.log("current item: " + this.getCurrentItem().title + "folder:" + this.currentDir.title + " : " + this.currentDir.pId);
        }

    };

    this.setCursorInView = function () {
        //TODO fix to be row perfect scroll
        var curBB = this.panel.find('.currentRow')[0].getBoundingClientRect();
        var wrapper = this.panel.parent()[0];
        var cupanelrBB = wrapper.getBoundingClientRect();

        var diffBotom = cupanelrBB.bottom - (curBB.bottom + 20);
        if (diffBotom < 0) {
            wrapper.scrollTop = -(diffBotom - 20 - wrapper.scrollTop);
        }

        var diffTop = cupanelrBB.top - curBB.top;
        if (diffTop > 0) {
            wrapper.scrollTop = -(diffTop + 20 - wrapper.scrollTop);
        }
    };
};