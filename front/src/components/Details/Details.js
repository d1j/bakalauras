import { ImCheckmark, ImCross, ImBin, ImPencil, ImList } from "react-icons/im";

function ActiveIcon() {
  return <ImCheckmark style={{ color: "green" }} />;
}
function DisabledIcon() {
  return <ImCross style={{ color: "red" }} />;
}
function EditIcon() {
  return <ImPencil style={{ color: "grey" }} />;
}
function DeleteIcon() {
  return <ImBin />;
}
function ListIcon() {
  return <ImList />;
}
export { ActiveIcon, DisabledIcon, EditIcon, DeleteIcon, ListIcon };
