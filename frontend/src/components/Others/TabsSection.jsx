import Button from "../Button/Button";

export default function TabsSection({ active, onChange }) {
    return (
        <section>
            <Button
                onClick={() => onChange('main')}
                isActive={active === 'main'}
            >Почему мы</Button>
            <Button
                isActive={active === 'feedback'}
                onClick={() => onChange('feedback')}>Обратная связь</Button>
            <Button
                isActive={active === 'effect'}
                onClick={() => onChange('effect')}>Effect</Button>
            <Button
            isActive={active === 'playground'}
            onClick= {() =>onChange('playground')}>
                Playground
            </Button>
        </section>
    )
}