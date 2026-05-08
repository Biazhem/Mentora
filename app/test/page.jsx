function Button({ title, children }) {
  return <button className=" p-2 bg-blue-200">{children}</button>;
}
export default function Page() {
  return (
    <>
      <Button>hello</Button>
      <Button>hello 3<span className="text-red-500">35</span></Button>
    </>
  );
}
