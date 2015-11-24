package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings	"
	"github.com/gorilla/websocket"

	//"container/list"
)

type CommanderFile struct {
	Title    string `json:"title"`
	Size     int64  `json:"size"`
	IsFolder bool   `json:"isFolder"`
}

type CommanderDir struct {
	files []CommanderFile
}

func main() {

	http.Handle("/s/", http.StripPrefix("/s/", http.FileServer(http.Dir("."))))
	http.HandleFunc("/ws/", wsHandler)
	log.Println("Listening...")

	http.ListenAndServe(":3000", nil)
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("wshandler")
	var upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer conn.Close()
	if err != nil {
		log.Println(err)
		return
	}

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			return
		}
		log.Print(message)

		err = conn.WriteMessage(messageType, []byte(strings.Join(getdrives(), ",")))
		if err != nil {
			return
		}
	}
}

func service(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hi there, I love %s!", r.URL.Path[1:])

	dirname := "static"
	fileInfoList, error := ioutil.ReadDir(dirname)
	if error != nil {
		fmt.Fprintf(w, " :( Hi there, I love %s!", r.URL.Path[1:])
	}

	var cDir CommanderDir
	cDir.files = make([]CommanderFile, 0)
	for _, dir := range fileInfoList {
		//extract data to our struct
		cDir.files = append(cDir.files, CommanderFile{dir.Name(), dir.Size(), dir.IsDir()})
	}

	j, err := json.Marshal(cDir)
	if err != nil {
		fmt.Fprintf(w, " :( Hi there, I love %s!", r.URL.Path[1:])
	} else {
		fmt.Fprintf(w, "%s\n", j)
	}
}

func getdrives() (r []string) {
	for _, drive := range "ABCDEFGHIJKLMNOPQRSTUVWXYZ" {
		_, err := os.Open(string(drive) + ":\\")
		if err == nil {
			r = append(r, string(drive))
		}
	}
	return
}
