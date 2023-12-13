import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const {state} = useNavigation();
  const submit = useSubmit();
  const params = useParams();
  const { data, isError } = useQuery({
    queryKey: ["events", { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
    staleTime: 10000,
  });

  // adding optimistic updating
  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     await queryClient.cancelQueries({
  //       queryKey: ["events", { id: params.id }],
  //     });
  //     const previousData = queryClient.getQueryData([
  //       "events",
  //       { id: params.id },
  //     ]);

  //     queryClient.setQueryData(["events", { id: params.id }], data.event);

  //     return { previousData };
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(
  //       ["events", { id: params.id }],
  //       context.previousData
  //     );
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events"]);
  //   },
  // });

  function handleSubmit(formData) {
    submit(formData, { method: "PUT" });
    // mutate({
    //   id: params.id,
    //   event: formData,
    // });
    // navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  return (
    <Modal onClose={handleClose}>
      {isError && (
        <ErrorBlock title="An error occurred" message="Could not load data" />
      )}
      {data && (
        <EventForm inputData={data} onSubmit={handleSubmit}>
          {state === "submitting" && <p>Submitting...</p>}
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </EventForm>
      )}
    </Modal>
  );
}

export const editEventLoader = ({ params }) => {
  return queryClient.fetchQuery({
    queryKey: ["events", { id: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });
};

export const editEventAction = async ({ request, params }) => {
  const data = await request.formData();

  const eventData = Object.fromEntries(data);

  await updateEvent({ id: params.id, event: eventData });
  queryClient.invalidateQueries({ queryKey: ["events", { id: params.id }] });
  return redirect("../");
};
