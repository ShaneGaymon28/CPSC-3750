import { 
    List, 
    Datagrid, 
    TextField, 
    NumberField, 
    SimpleForm, 
    Create, 
    Edit, 
    TextInput, 
    ReferenceField, 
    ReferenceInput,
    NumberInput, 
    Show,
    SimpleShowLayout 
} from "react-admin";

export const GradesList = () => (
    <List>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <ReferenceField label="Student Name" source="student_id" reference="students" >
                <TextField source="name" />
            </ReferenceField>
            <TextField source="type" />
            <NumberField source="grade" />
            <NumberField source="max" />
        </Datagrid>
    </List>
);

export const GradesShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField label="Student Name" source="student_id" reference="students" >
                <TextField source="name" />
            </ReferenceField>
            <TextField source="type" />
            <NumberField source="grade" />
            <NumberField source="max" />
        </SimpleShowLayout>
    </Show>
);

export const GradesEdit = () => (
    <Edit>
        <SimpleForm>
            <TextField source="id" />
            <ReferenceInput label="Student Name" source="student_id" reference="students" >
                <TextInput source="name" />
            </ReferenceInput>
            <TextInput source="type" />
            <NumberInput source="max" />
            <NumberInput source="grade" />
        </SimpleForm>
    </Edit>
);

export const GradesCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="student_id" />
            <TextInput source="type" />
            <NumberInput source="max" />
            <NumberInput source="grade" />
        </SimpleForm>
    </Create>

);