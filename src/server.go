package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"encoding/json"


//"container/list"
)

type CommanderFile struct {
	Title    string `json:"title"`
	Size     int64 `json:"size"`
	IsFolder bool `json:"isFolder"`

}

type CommanderDir struct {
	files []CommanderFile
}



func main() {
	http.Handle("/s/", http.StripPrefix("/s/", http.FileServer(http.Dir("."))))
	log.Println("Listening...")
	http.ListenAndServe(":3000", nil)
}


func service(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hi there, I love %s!", r.URL.Path[1:])

	dirname := "static"
	fileInfoList, error := ioutil.ReadDir(dirname)
	if error != nil {
		fmt.Fprintf(w, " :( Hi there, I love %s!", r.URL.Path[1:])
	}

	var cDir CommanderDir;
	cDir.files = make([]CommanderFile, 0)
	for _, dir := range fileInfoList {
		//extract data to our struct
		cDir.files = append(cDir.files, CommanderFile{dir.Name(), dir.Size(), dir.IsDir()})
	}


	j, err := json.Marshal(cDir)
	if err != nil {
		fmt.Fprintf(w, " :( Hi there, I love %s!", r.URL.Path[1:])
	}else {
		fmt.Fprintf(w, "%s\n", j)
	}
}
