import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";
import { useState } from "react";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  const {
    mutate,
    isPending: deletePending,
    isError: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const deleteHandler = () => {
    mutate({
      id: params.id,
    });
  };

  const startDeleting = () => {
    setIsDeleting(true);
  };

  const stopDeleting = () => {
    setIsDeleting(false);
  };

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occured!"
        message={error.info?.message || "Could not fetch event details"}
      />
    );
  }

  if (data) {
    content = (
      <>
        {isDeleting && (
          <Modal onClose={stopDeleting}>
            <h2>Are you sure you?</h2>
            <p>Once deleted, this action cannot be undone</p>
            <div className="form-actions">
              <button className="button-text" onClick={stopDeleting}>
                Cancel
              </button>
              <button className="button" onClick={deleteHandler}>
                {deletePending ? "Deleting..." : "Delete"}
              </button>
            </div>
            {deleteError && (
              <ErrorBlock
                title="Error occurred!"
                message="Could not delete event"
              />
            )}
          </Modal>
        )}
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={startDeleting} disabled={deletePending}>
              Delete
            </button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {data.date} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
