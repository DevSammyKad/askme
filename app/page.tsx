import bg from '@/app/images/bg.svg';
import Image from 'next/image';
export default function page() {
  return (
    <div className="">
      <Image src={bg} alt="bg" fill className="object-cover object-center" />
    </div>
  );
}
