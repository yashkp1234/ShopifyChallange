import React, { useContext, useState } from "react";
import { Menu, Segment, Modal, Header } from "semantic-ui-react";
import { Link } from "react-router-dom";

import { AuthContext } from "../context/auth";
import DropZone from "../components/DropZone";

function MenuBar() {
  const { user, logout } = useContext(AuthContext);
  const pathname = window.location.pathname;
  const path = pathname === "/" ? "home" : pathname.substr(1);
  const isPosts = path.split("/")[0] === "posts";
  const [activeItem, setActiveItem] = useState(path);
  const [modal, setModal] = useState(false);

  const handleItemClick = (e, { name }) => setActiveItem(name);
  let menuBar = "";

  if (user) {
    menuBar = (
      <Segment inverted attached>
        <Menu secondary inverted pointing size="massive">
          <Menu.Item
            name={user.username}
            active
            as={Link}
            to="/"
            icon="user circle"
          />
          <Menu.Menu position="right">
            {!isPosts && (
              <Menu.Item
                name="upload"
                onClick={() => setModal(true)}
                icon="up arrow"
              />
            )}
          </Menu.Menu>
          <Menu.Item name="logout" onClick={logout} icon="x icon" />
          <Modal
            closeIcon
            open={modal}
            onClose={() => setModal(false)}
            closeOnDimmerClick={true}
          >
            <Header icon="picture" content={"Upload New Profile Image"} />
            <Modal.Content>
              <DropZone user={user} setModal={setModal}></DropZone>
            </Modal.Content>
          </Modal>
        </Menu>
      </Segment>
    );
  } else {
    menuBar = (
      <Segment inverted attached>
        <Menu secondary inverted pointing size="massive">
          <Menu.Item
            icon="home"
            name="home"
            active={activeItem === "home"}
            onClick={handleItemClick}
            as={Link}
            to="/"
          />
          <Menu.Menu position="right">
            <Menu.Item
              icon="arrow alterante circle right"
              name="login"
              active={activeItem === "login"}
              onClick={handleItemClick}
              as={Link}
              to="/login"
            />
            <Menu.Item
              icon="clipboard list"
              name="register"
              active={activeItem === "register"}
              onClick={handleItemClick}
              as={Link}
              to="/register"
            />
          </Menu.Menu>
        </Menu>
      </Segment>
    );
  }

  return menuBar;
}

export default MenuBar;
