// server implementation of Go

package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"time"
)

type result struct {
	Status int         `json:"status"`
	Data   interface{} `json:"data"`
}

func main() {
	handler := func(w http.ResponseWriter, req *http.Request) {
		fmt.Println(req.Method, req.URL, "Origin: "+req.Header.Get("Origin") /* req.Header */)

		// if read body in go func() {}, http error, invalid Read on closed Body
		data, err := ioutil.ReadAll(req.Body)

		if err != nil {
			panic(err)
		}

		w.Header().Add("Access-Control-Allow-Origin", "*")
		w.Header().Add("Access-Control-Allow-Headers", "Accept, Content-Type")
		w.Header().Add("Content-Type", "application/json")

		// unnecessary, but should be put after Headers setting
		// w.WriteHeader(200)

		// eager return, can be used for health checking
		if req.Method != "POST" {
			json.NewEncoder(w).Encode(result{0, "success"})

			return
		}

		go func() {
			// bin path when run as a bin file, otherwise /var/*
			ex, err := os.Executable()

			if err != nil {
				panic(err)
			}

			now := time.Now()
			file := now.Format("2006-01-02") + ".json"

			err = ioutil.WriteFile(path.Join(path.Dir(ex), "../db", file), data, 0644)

			if err != nil {
				panic(err)
			}
		}()

		json.NewEncoder(w).Encode(result{0, "success"})
	}

	http.HandleFunc("/", handler)

	if err := http.ListenAndServe(":1234", nil); err != nil {
		panic(err)
	}
}
