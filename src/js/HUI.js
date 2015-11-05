var HelperUI = function () {

    this.getFileIcon = function (commanderFile) {
        var icon;
        if (commanderFile.isFolder) {
            icon = "glyphicon glyphicon-folder-open";
        }
        else {
            switch (commanderFile.type) {
                //case "xx":
                //    icon = "glyphicon glyphicon-xxx;
                //...
                default:
                    icon = "glyphicon glyphicon-file";
                    break;
            }
        }
        return '<span class="' + icon + ' wc_panel_icon"></span>';
    };
};
