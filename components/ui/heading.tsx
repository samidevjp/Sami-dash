interface HeadingProps {
  title: string;
  description: string;
  titleClass?: string;
  descriptionClass?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  title,
  description,
  titleClass = null,
  descriptionClass = null
}) => {
  return (
    <div>
      <h2
        className={`text-3xl font-bold tracking-tight ${
          titleClass ? titleClass : ''
        }`}
      >
        {title}
      </h2>
      <p
        className={`text-sm text-muted-foreground ${
          descriptionClass ? descriptionClass : ''
        }`}
      >
        {description}
      </p>
    </div>
  );
};
