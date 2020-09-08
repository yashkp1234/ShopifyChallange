import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Button,
  Checkbox,
  Modal,
  Image,
  Form,
  Label,
  Grid,
  GridColumn,
  GridRow,
  Divider,
} from "semantic-ui-react";
import { Mutation } from "react-apollo";
import { UPLOAD_MULTIPLE_PHOTO } from "../util/graphql";

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: "border-box",
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
  margin: "0 auto",
};

const img = {
  display: "block",
  width: "auto",
  height: "100%",
  margin: "0 auto",
};

async function toDataURL(url) {
  var xhr = new XMLHttpRequest();
  return await new Promise(function (resolve, reject) {
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(xhr.response);
      reader.onerror = function (e) {
        reject(e);
      };
    };
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  });
}

function DropZone({ setModal }) {
  const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [is_public, setPublic] = useState(true);
  const [currFile, setcurrFile] = useState({});
  const [currUrl, setCurrUrl] = useState();
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
            completed: false,
          })
        )
      );
    },
  });

  const handleChangeDescription = (e) => {
    setDescription(e.target.value);
  };

  const handleChangeTags = (e) => {
    setTags(e.target.value.split(","));
  };

  const handleChangePublic = () => {
    setPublic(!is_public);
  };

  const handleModalClose = () => {
    if (description === "" || tags.length === 0) {
      window.alert("Description and Tag cannot be empty");
    } else {
      let new_file = currFile.file;
      Object.assign(new_file, {
        description,
        tags,
        public: is_public,
        completed: true,
      });
      let new_files = files.slice();
      new_files[currFile.index] = new_file;
      setFiles(new_files);
      setDescription("");
      setTags([]);
      setPublic(true);
      setOpen(false);
    }
  };

  const setDescriptionAndTags = (file, index) => {
    setcurrFile({ file, index });
    setCurrUrl(URL.createObjectURL(file));
    if (file.completed) {
      setDescription(file.description);
      setTags(file.tags);
      setPublic(file.public);
    }
    setOpen(true);
  };

  const handleClose = async (multipleUpload, loading) => {
    let completedAll = files.every((file) => file.completed);
    if (completedAll) {
      let new_files = files.slice();
      let photos = [];
      for await (const file of new_files) {
        photos.push({
          url: await toDataURL(URL.createObjectURL(file)),
          public: file.public,
          description: file.description,
          tags: file.tags,
        });
      }
      multipleUpload({
        variables: { photoInput: photos },
        onError: (e) => {
          console.log(e, "hello");
        },
        onCompleted: (data) => {
          console.log(data);
        },
      });
      setModal(false);
    } else {
      window.alert("There are photos which need info to be inputted!");
    }
  };

  const thumbs = files.map((file, index) => {
    return !file.completed ? (
      <div style={{ display: "grid" }}>
        <div style={thumb} key={file.name}>
          <div style={thumbInner}>
            <img src={file.preview} style={img} />
          </div>
        </div>
        <Button
          size="small"
          negative
          onClick={() => setDescriptionAndTags(file, index)}
        >
          Need Info
        </Button>
      </div>
    ) : (
      <div style={{ display: "grid" }}>
        <div style={thumb} key={file.name}>
          <div style={thumbInner}>
            <img src={file.preview} style={img} />
          </div>
        </div>
        <Button
          size="small"
          positive
          onClick={() => setDescriptionAndTags(file, index)}
        >
          Change Info
        </Button>
      </div>
    );
  });

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  return (
    <section className="container">
      <Mutation mutation={UPLOAD_MULTIPLE_PHOTO}>
        {(multipleUpload, { _, loading }) => {
          return (
            <section className="container">
              <div {...getRootProps({ className: "dropzone" })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
              <aside style={thumbsContainer}>{thumbs}</aside>
              <Divider></Divider>
              <Button
                primary
                onClick={() => handleClose(multipleUpload, loading)}
              >
                Complete Upload
              </Button>
              <Modal
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                closeOnDimmerClick={false}
                open={open}
              >
                <Modal.Header>Set Photo Description and Tags</Modal.Header>
                <Modal.Content>
                  <Grid columns={16} divided>
                    <GridRow>
                      <GridColumn aligned width={6}>
                        <Image size="small" centered src={currUrl} />
                      </GridColumn>
                      <GridColumn width={10}>
                        <Modal.Description>
                          <Form>
                            <Form.Field>
                              <input
                                type="text"
                                placeholder="Description"
                                value={description}
                                onChange={handleChangeDescription}
                              />
                            </Form.Field>
                            <Form.Field>
                              <input
                                type="text"
                                placeholder="Tags"
                                value={tags.join(",")}
                                onChange={handleChangeTags}
                              />
                              <Label pointing="up">
                                Separate Tags by Comma
                              </Label>
                            </Form.Field>
                            <Form.Field>
                              <Checkbox
                                checked={is_public}
                                toggle
                                label="Public"
                                onChange={handleChangePublic}
                              />
                            </Form.Field>
                          </Form>
                        </Modal.Description>
                      </GridColumn>
                    </GridRow>
                  </Grid>
                </Modal.Content>
                <Modal.Actions>
                  <Button
                    content="Confirm"
                    labelPosition="right"
                    icon="checkmark"
                    onClick={handleModalClose}
                    positive
                  />
                </Modal.Actions>
              </Modal>
            </section>
          );
        }}
      </Mutation>
    </section>
  );
}

export default DropZone;
